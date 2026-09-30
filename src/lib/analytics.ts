import type { Budget, Category, Transaction } from '@/models/types';
import { dayjs, inRange, ISO_DATE, monthKey, type DateRange } from './date';

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + t.amount, 0);
}

export function computeTotals(transactions: Transaction[]): Totals {
  const income = sumByType(transactions, 'income');
  const expense = sumByType(transactions, 'expense');
  return { income, expense, balance: income - expense };
}

export function filterByRange(transactions: Transaction[], range: DateRange): Transaction[] {
  return transactions.filter((t) => inRange(t.date, range));
}

export interface CategorySlice {
  categoryId: string;
  name: string;
  color: string;
  value: number;
}

export function breakdownByCategory(
  transactions: Transaction[],
  categories: Category[],
  type: Transaction['type'],
): CategorySlice[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }
  const byId = new Map(categories.map((c) => [c.id, c]));
  return [...totals.entries()]
    .map(([categoryId, value]) => {
      const category = byId.get(categoryId);
      return {
        categoryId,
        name: category?.name ?? 'Без категории',
        color: category?.color ?? '#9e9e9e',
        value,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export interface DynamicsPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

// Период не длиннее этого числа дней строится по дням, иначе — по месяцам.
export const DAY_GRANULARITY_MAX_DAYS = 31;

function rangeLengthInDays(range: DateRange): number {
  return dayjs(range.to).diff(dayjs(range.from), 'day') + 1;
}

/**
 * Точки динамики доходов/расходов/баланса по выбранному периоду.
 * Гранулярность адаптивная: ≤ 31 дня — по дням, иначе — по месяцам.
 */
export function dynamicsForRange(transactions: Transaction[], range: DateRange): DynamicsPoint[] {
  const byDay = rangeLengthInDays(range) <= DAY_GRANULARITY_MAX_DAYS;

  const buckets = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    const key = byDay ? dayjs(t.date).format(ISO_DATE) : monthKey(t.date);
    const bucket = buckets.get(key) ?? { income: 0, expense: 0 };
    if (t.type === 'income') bucket.income += t.amount;
    else bucket.expense += t.amount;
    buckets.set(key, bucket);
  }

  const result: DynamicsPoint[] = [];
  const endKey = byDay ? dayjs(range.to).format(ISO_DATE) : monthKey(range.to);
  let cursor = byDay ? dayjs(range.from) : dayjs(range.from).startOf('month');
  let key = byDay ? cursor.format(ISO_DATE) : monthKey(cursor);

  while (key <= endKey) {
    const bucket = buckets.get(key) ?? { income: 0, expense: 0 };
    result.push({
      key,
      label: cursor.format(byDay ? 'D MMM' : 'MMM YY'),
      income: bucket.income,
      expense: bucket.expense,
      balance: bucket.income - bucket.expense,
    });
    cursor = cursor.add(1, byDay ? 'day' : 'month');
    key = byDay ? cursor.format(ISO_DATE) : monthKey(cursor);
  }

  return result;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  ratio: number;
  exceeded: boolean;
}

export function computeBudgetProgress(
  budget: Budget,
  transactions: Transaction[],
  range: DateRange,
): BudgetProgress {
  const relevant = filterByRange(transactions, range).filter(
    (t) => t.type === 'expense' && (budget.categoryId === null || t.categoryId === budget.categoryId),
  );
  const spent = relevant.reduce((acc, t) => acc + t.amount, 0);
  const ratio = budget.limit > 0 ? spent / budget.limit : 0;
  return { budget, spent, ratio, exceeded: spent > budget.limit };
}

export function allTags(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  for (const t of transactions) {
    for (const tag of t.tags) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'));
}
