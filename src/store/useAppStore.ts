import { create } from 'zustand';
import type {
  AppData,
  Budget,
  Category,
  RecurringRule,
  Settings,
  Transaction,
} from '@/models/types';
import { DEFAULT_CATEGORIES } from '@/models/defaults';
import { DEFAULT_SETTINGS } from '@/models/types';
import { createId } from '@/lib/id';
import { toISODate } from '@/lib/date';
import { occurrencesBetween } from '@/lib/recurring';
import { createLocalStorageRepository, type DataRepository } from '@/storage';

export interface NewTransactionInput {
  type: Transaction['type'];
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  tags: string[];
}

export interface NewRecurringInput {
  type: Transaction['type'];
  amount: number;
  categoryId: string;
  note?: string;
  tags: string[];
  frequency: RecurringRule['frequency'];
  startDate: string;
  endDate?: string;
}

export interface NewBudgetInput {
  categoryId: string | null;
  period: Budget['period'];
  limit: number;
}

export interface AppState {
  data: AppData;
  addTransaction: (input: NewTransactionInput) => void;
  updateTransaction: (id: string, input: NewTransactionInput) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (input: Omit<Category, 'id' | 'isDefault'>) => void;
  updateCategory: (id: string, input: Omit<Category, 'id' | 'isDefault'>) => void;
  deleteCategory: (id: string, reassignTo?: string | null) => void;
  addBudget: (input: NewBudgetInput) => void;
  updateBudget: (id: string, input: NewBudgetInput) => void;
  deleteBudget: (id: string) => void;
  addRecurringRule: (input: NewRecurringInput) => void;
  updateRecurringRule: (id: string, input: NewRecurringInput) => void;
  deleteRecurringRule: (id: string) => void;
  toggleRecurringPaused: (id: string) => void;
  generatePendingTransactions: () => number;
  updateSettings: (patch: Partial<Settings>) => void;
  importData: (data: AppData) => void;
  resetData: () => void;
}

function emptyData(): AppData {
  return {
    transactions: [],
    categories: [...DEFAULT_CATEGORIES],
    budgets: [],
    recurringRules: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function createInitialData(): AppData {
  const stored = repository.load();
  return stored ?? emptyData();
}

// Repository is created lazily so tests can swap in a different adapter.
let repository: DataRepository = createLocalStorageRepository();

export function setRepository(next: DataRepository): void {
  repository = next;
}

function persist(data: AppData): void {
  repository.save(data);
}

export const useAppStore = create<AppState>((set, get) => {
  const commit = (producer: (data: AppData) => AppData) => {
    const next = producer(get().data);
    persist(next);
    set({ data: next });
  };

  return {
    data: createInitialData(),

    addTransaction: (input) =>
      commit((data) => {
        const now = new Date().toISOString();
        const transaction: Transaction = {
          id: createId('tx'),
          ...input,
          isRecurring: false,
          createdAt: now,
          updatedAt: now,
        };
        return { ...data, transactions: [transaction, ...data.transactions] };
      }),

    updateTransaction: (id, input) =>
      commit((data) => ({
        ...data,
        transactions: data.transactions.map((t) =>
          t.id === id ? { ...t, ...input, updatedAt: new Date().toISOString() } : t,
        ),
      })),

    deleteTransaction: (id) =>
      commit((data) => ({
        ...data,
        transactions: data.transactions.filter((t) => t.id !== id),
      })),

    addCategory: (input) =>
      commit((data) => ({
        ...data,
        categories: [...data.categories, { ...input, id: createId('cat'), isDefault: false }],
      })),

    updateCategory: (id, input) =>
      commit((data) => ({
        ...data,
        categories: data.categories.map((c) => (c.id === id ? { ...c, ...input } : c)),
      })),

    deleteCategory: (id, reassignTo = null) =>
      commit((data) => {
        const affected = data.transactions.filter((t) => t.categoryId === id);
        // Нельзя удалить категорию, к которой привязаны операции: нужен перенос.
        if (affected.length > 0 && !reassignTo) return data;
        const transactions = reassignTo
          ? data.transactions.map((t) =>
              t.categoryId === id ? { ...t, categoryId: reassignTo } : t,
            )
          : data.transactions;
        return {
          ...data,
          transactions,
          categories: data.categories.filter((c) => c.id !== id),
          budgets: data.budgets.filter((b) => b.categoryId !== id),
          recurringRules: data.recurringRules.filter((r) => r.categoryId !== id),
        };
      }),

    addBudget: (input) =>
      commit((data) => ({
        ...data,
        budgets: [...data.budgets, { ...input, id: createId('budget') }],
      })),

    updateBudget: (id, input) =>
      commit((data) => ({
        ...data,
        budgets: data.budgets.map((b) => (b.id === id ? { ...b, ...input } : b)),
      })),

    deleteBudget: (id) =>
      commit((data) => ({ ...data, budgets: data.budgets.filter((b) => b.id !== id) })),

    addRecurringRule: (input) =>
      commit((data) => ({
        ...data,
        recurringRules: [
          ...data.recurringRules,
          { ...input, id: createId('rec'), paused: false },
        ],
      })),

    updateRecurringRule: (id, input) =>
      commit((data) => ({
        ...data,
        recurringRules: data.recurringRules.map((r) => (r.id === id ? { ...r, ...input } : r)),
      })),

    deleteRecurringRule: (id) =>
      commit((data) => {
        const rule = data.recurringRules.find((r) => r.id === id);
        return {
          ...data,
          recurringRules: data.recurringRules.filter((r) => r.id !== id),
          transactions: rule
            ? data.transactions.filter((t) => t.recurringId !== id)
            : data.transactions,
        };
      }),

    toggleRecurringPaused: (id) =>
      commit((data) => ({
        ...data,
        recurringRules: data.recurringRules.map((r) =>
          r.id === id ? { ...r, paused: !r.paused } : r,
        ),
      })),

    generatePendingTransactions: () => {
      const today = toISODate(new Date());
      let created = 0;
      commit((data) => {
        const now = new Date().toISOString();
        const newTransactions: Transaction[] = [];
        const rules = data.recurringRules.map((rule) => {
          if (rule.paused) return rule;
          const dates = occurrencesBetween(rule, rule.lastGeneratedDate ?? null, today);
          if (dates.length === 0) return rule;
          for (const date of dates) {
            newTransactions.push({
              id: createId('tx'),
              type: rule.type,
              amount: rule.amount,
              categoryId: rule.categoryId,
              date,
              note: rule.note,
              tags: rule.tags,
              isRecurring: true,
              recurringId: rule.id,
              createdAt: now,
              updatedAt: now,
            });
          }
          created += dates.length;
          return { ...rule, lastGeneratedDate: dates[dates.length - 1] };
        });
        return {
          ...data,
          recurringRules: rules,
          transactions: [...newTransactions, ...data.transactions],
        };
      });
      return created;
    },

    updateSettings: (patch) =>
      commit((data) => ({ ...data, settings: { ...data.settings, ...patch } })),

    importData: (incoming) => commit(() => incoming),

    resetData: () => commit(() => emptyData()),
  };
});
