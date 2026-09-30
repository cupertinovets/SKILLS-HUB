import type { RecurringRule } from '@/models/types';
import { createId } from './id';
import { dayjs, ISO_DATE, toISODate } from './date';

const MAX_ITERATIONS = 1000;

/**
 * Возвращает даты, попавшие в расписание правила от `from` (эксклюзивно) до `to`
 * (включительно), начиная с startDate и не выходя за endDate.
 */
export function occurrencesBetween(rule: RecurringRule, from: string | null, to: string): string[] {
  const start = dayjs(rule.startDate);
  const end = dayjs(to);
  const lower = from ? dayjs(from) : start.subtract(1, 'day');
  const ruleEnd = rule.endDate ? dayjs(rule.endDate) : null;

  const dates: string[] = [];
  let cursor = start;
  let iterations = 0;

  while (
    cursor.isBefore(end, 'day') || cursor.isSame(end, 'day')
  ) {
    if (ruleEnd && cursor.isAfter(ruleEnd, 'day')) break;
    if (iterations > MAX_ITERATIONS) break;
    if (cursor.isAfter(lower, 'day')) {
      dates.push(cursor.format(ISO_DATE));
    }
    cursor = advance(cursor, rule.frequency);
    iterations += 1;
  }
  return dates;
}

function advance(date: ReturnType<typeof dayjs>, frequency: RecurringRule['frequency']) {
  switch (frequency) {
    case 'daily':
      return date.add(1, 'day');
    case 'weekly':
      return date.add(1, 'week');
    case 'monthly':
      return date.add(1, 'month');
    case 'yearly':
      return date.add(1, 'year');
  }
}

export interface GeneratedTransaction {
  ruleId: string;
  date: string;
}

export function generatePending(
  rules: RecurringRule[],
  today = toISODate(new Date()),
): GeneratedTransaction[] {
  const generated: GeneratedTransaction[] = [];
  for (const rule of rules) {
    const dates = occurrencesBetween(rule, rule.lastGeneratedDate ?? null, today);
    for (const date of dates) {
      generated.push({ ruleId: rule.id, date });
    }
  }
  return generated;
}

export function newTransactionId(): string {
  return createId('tx');
}
