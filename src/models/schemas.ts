import { z } from 'zod';

export const transactionTypeSchema = z.enum(['income', 'expense']);
export const budgetPeriodSchema = z.enum(['month', 'week']);
export const recurringFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, 'Ожидается ISO-дата');

export const transactionSchema = z.object({
  id: z.string().min(1),
  type: transactionTypeSchema,
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  date: dateStringSchema,
  note: z.string().optional(),
  tags: z.array(z.string()),
  isRecurring: z.boolean(),
  recurringId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: transactionTypeSchema,
  color: z.string().min(1),
  icon: z.string().optional(),
  isDefault: z.boolean(),
});

export const budgetSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().nullable(),
  period: budgetPeriodSchema,
  limit: z.number().positive(),
  month: z.string().optional(),
});

export const recurringRuleSchema = z.object({
  id: z.string().min(1),
  type: transactionTypeSchema,
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  note: z.string().optional(),
  tags: z.array(z.string()),
  frequency: recurringFrequencySchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional(),
  lastGeneratedDate: dateStringSchema.optional(),
  paused: z.boolean().optional(),
});

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  currency: z.literal('RUB'),
  startOfWeek: z.union([z.literal(0), z.literal(1)]),
});

export const appDataSchema = z.object({
  transactions: z.array(transactionSchema),
  categories: z.array(categorySchema),
  budgets: z.array(budgetSchema),
  recurringRules: z.array(recurringRuleSchema),
  settings: settingsSchema,
});

export const transactionFormSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .number({ invalid_type_error: 'Введите сумму' })
    .positive('Сумма должна быть больше 0'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  date: dateStringSchema,
  note: z.string().optional(),
  tags: z.array(z.string()),
});

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  type: transactionTypeSchema,
  color: z.string().min(1),
  icon: z.string().optional(),
});

export const budgetFormSchema = z.object({
  categoryId: z.string().nullable(),
  period: budgetPeriodSchema,
  limit: z
    .number({ invalid_type_error: 'Введите лимит' })
    .positive('Лимит должен быть больше 0'),
});

export const recurringFormSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .number({ invalid_type_error: 'Введите сумму' })
    .positive('Сумма должна быть больше 0'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  note: z.string().optional(),
  tags: z.array(z.string()),
  frequency: recurringFrequencySchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional(),
});

export const importValidationSchema = appDataSchema;
