import { beforeEach, describe, expect, it } from 'vitest';
import type { AppData } from '@/models/types';
import { DEFAULT_SETTINGS } from '@/models/types';
import { DEFAULT_CATEGORIES } from '@/models/defaults';
import { useAppStore, setRepository } from './useAppStore';

function memoryRepository() {
  let stored: AppData | null = null;
  return {
    load: () => stored,
    save: (data: AppData) => {
      stored = data;
    },
    clear: () => {
      stored = null;
    },
  };
}

function resetStore() {
  const repo = memoryRepository();
  setRepository(repo);
  useAppStore.setState({
    data: {
      transactions: [],
      categories: [...DEFAULT_CATEGORIES],
      budgets: [],
      recurringRules: [],
      settings: { ...DEFAULT_SETTINGS },
    },
  });
}

describe('useAppStore', () => {
  beforeEach(resetStore);

  it('добавляет и удаляет операцию', () => {
    const { addTransaction, deleteTransaction } = useAppStore.getState();
    addTransaction({
      type: 'expense',
      amount: 500,
      categoryId: 'cat-food',
      date: '2026-01-10',
      tags: ['еда'],
    });
    expect(useAppStore.getState().data.transactions).toHaveLength(1);
    const id = useAppStore.getState().data.transactions[0].id;
    deleteTransaction(id);
    expect(useAppStore.getState().data.transactions).toHaveLength(0);
  });

  it('не удаляет категорию с операциями без переноса', () => {
    const { addTransaction, deleteCategory } = useAppStore.getState();
    addTransaction({
      type: 'expense',
      amount: 100,
      categoryId: 'cat-food',
      date: '2026-01-10',
      tags: [],
    });
    deleteCategory('cat-food');
    expect(useAppStore.getState().data.categories.some((c) => c.id === 'cat-food')).toBe(true);
  });

  it('переносит операции при удалении категории', () => {
    const { addTransaction, deleteCategory } = useAppStore.getState();
    addTransaction({
      type: 'expense',
      amount: 100,
      categoryId: 'cat-food',
      date: '2026-01-10',
      tags: [],
    });
    deleteCategory('cat-food', 'cat-home');
    const state = useAppStore.getState().data;
    expect(state.categories.some((c) => c.id === 'cat-food')).toBe(false);
    expect(state.transactions[0].categoryId).toBe('cat-home');
  });

  it('генерирует пропущенные повторяющиеся операции', () => {
    const { addRecurringRule, generatePendingTransactions } = useAppStore.getState();
    addRecurringRule({
      type: 'expense',
      amount: 1000,
      categoryId: 'cat-home',
      tags: [],
      frequency: 'monthly',
      startDate: '2026-07-01',
    });
    const created = generatePendingTransactions();
    expect(created).toBeGreaterThan(0);
    const transactions = useAppStore.getState().data.transactions;
    expect(transactions.every((t) => t.isRecurring)).toBe(true);
    expect(transactions.every((t) => t.recurringId)).toBe(true);
  });

  it('сохраняет изменения в репозиторий', () => {
    const repo = memoryRepository();
    setRepository(repo);
    useAppStore.getState().addTransaction({
      type: 'income',
      amount: 100,
      categoryId: 'cat-salary',
      date: '2026-01-10',
      tags: [],
    });
    expect(repo.load()?.transactions).toHaveLength(1);
  });
});
