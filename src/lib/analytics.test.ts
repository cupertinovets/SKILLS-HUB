import { describe, expect, it } from 'vitest';
import type { Budget, Category, Transaction } from '@/models/types';
import {
  breakdownByCategory,
  computeBudgetProgress,
  computeTotals,
  dynamicsForRange,
} from './analytics';

function tx(partial: Partial<Transaction> & Pick<Transaction, 'type' | 'amount' | 'date'>): Transaction {
  return {
    id: Math.random().toString(36),
    categoryId: 'cat-food',
    tags: [],
    isRecurring: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('computeTotals', () => {
  it('считает доходы, расходы и баланс', () => {
    const totals = computeTotals([
      tx({ type: 'income', amount: 1000, date: '2026-01-05' }),
      tx({ type: 'expense', amount: 400, date: '2026-01-06' }),
      tx({ type: 'expense', amount: 100, date: '2026-01-07' }),
    ]);
    expect(totals).toEqual({ income: 1000, expense: 500, balance: 500 });
  });
});

describe('breakdownByCategory', () => {
  const categories: Category[] = [
    { id: 'cat-food', name: 'Продукты', type: 'expense', color: '#f00', isDefault: true },
    { id: 'cat-salary', name: 'Зарплата', type: 'income', color: '#0f0', isDefault: true },
  ];

  it('суммирует и сортирует по убыванию', () => {
    const slices = breakdownByCategory(
      [
        tx({ type: 'expense', amount: 300, date: '2026-01-05' }),
        tx({ type: 'expense', amount: 300, date: '2026-01-06' }),
        tx({ type: 'expense', amount: 700, date: '2026-01-07', categoryId: 'cat-home' }),
      ],
      categories,
      'expense',
    );
    expect(slices[0].value).toBe(700);
    expect(slices[0].name).toBe('Без категории');
    expect(slices[1].value).toBe(600);
    expect(slices[1].name).toBe('Продукты');
  });
});

describe('computeBudgetProgress', () => {
  const budget: Budget = {
    id: 'b1',
    categoryId: 'cat-food',
    period: 'month',
    limit: 1000,
  };

  it('отмечает превышение лимита', () => {
    const progress = computeBudgetProgress(
      budget,
      [tx({ type: 'expense', amount: 1200, date: '2026-01-10' })],
      { from: '2026-01-01', to: '2026-01-31' },
    );
    expect(progress.spent).toBe(1200);
    expect(progress.exceeded).toBe(true);
    expect(progress.ratio).toBeCloseTo(1.2);
  });

  it('учитывает только расходы выбранной категории', () => {
    const progress = computeBudgetProgress(
      budget,
      [
        tx({ type: 'expense', amount: 500, date: '2026-01-10' }),
        tx({ type: 'expense', amount: 500, date: '2026-01-10', categoryId: 'cat-home' }),
        tx({ type: 'income', amount: 500, date: '2026-01-10' }),
      ],
      { from: '2026-01-01', to: '2026-01-31' },
    );
    expect(progress.spent).toBe(500);
  });
});

describe('dynamicsForRange', () => {
  it('для периода ≤ 31 дня строит дневные точки, включая границы', () => {
    const points = dynamicsForRange([], { from: '2026-01-01', to: '2026-01-31' });
    expect(points).toHaveLength(31);
    expect(points[0]).toMatchObject({ key: '2026-01-01', income: 0, expense: 0, balance: 0 });
    expect(points[30]).toMatchObject({ key: '2026-01-31' });
  });

  it('для периода длиннее 31 дня строит месячные точки', () => {
    const points = dynamicsForRange([], { from: '2026-01-01', to: '2026-03-31' });
    expect(points.map((p) => p.key)).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('на границе 32 дня переключается на месячную гранулярность', () => {
    const points = dynamicsForRange([], { from: '2026-01-01', to: '2026-02-01' });
    expect(points.map((p) => p.key)).toEqual(['2026-01', '2026-02']);
  });

  it('раскладывает операции по бакетам и считает баланс', () => {
    const points = dynamicsForRange(
      [
        tx({ type: 'income', amount: 1000, date: '2026-01-05' }),
        tx({ type: 'expense', amount: 400, date: '2026-01-05' }),
        tx({ type: 'expense', amount: 100, date: '2026-01-20' }),
      ],
      { from: '2026-01-01', to: '2026-01-31' },
    );
    expect(points[4]).toMatchObject({ income: 1000, expense: 400, balance: 600 });
    expect(points[19]).toMatchObject({ income: 0, expense: 100, balance: -100 });
  });
});
