export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  tags: string[];
  isRecurring: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  isDefault: boolean;
}

export type BudgetPeriod = 'month' | 'week';

export interface Budget {
  id: string;
  categoryId: string | null;
  period: BudgetPeriod;
  limit: number;
  month?: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note?: string;
  tags: string[];
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastGeneratedDate?: string;
  paused?: boolean;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  currency: 'RUB';
  startOfWeek: 0 | 1;
}

export interface AppData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurringRules: RecurringRule[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  currency: 'RUB',
  startOfWeek: 1,
};
