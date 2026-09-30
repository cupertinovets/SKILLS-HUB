import { describe, expect, it } from 'vitest';
import type { RecurringRule } from '@/models/types';
import { occurrencesBetween } from './recurring';

function rule(partial: Partial<RecurringRule>): RecurringRule {
  return {
    id: 'r1',
    type: 'expense',
    amount: 100,
    categoryId: 'cat-food',
    tags: [],
    frequency: 'monthly',
    startDate: '2026-01-15',
    ...partial,
  };
}

describe('occurrencesBetween', () => {
  it('генерирует ежемесячные даты в диапазоне', () => {
    const dates = occurrencesBetween(rule({}), null, '2026-04-20');
    expect(dates).toEqual(['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15']);
  });

  it('исключает уже сгенерированные даты', () => {
    const dates = occurrencesBetween(rule({}), '2026-02-15', '2026-03-15');
    expect(dates).toEqual(['2026-03-15']);
  });

  it('не выходит за дату окончания', () => {
    const dates = occurrencesBetween(rule({ endDate: '2026-02-28' }), null, '2026-06-01');
    expect(dates).toEqual(['2026-01-15', '2026-02-15']);
  });

  it('поддерживает ежедневную периодичность', () => {
    const dates = occurrencesBetween(
      rule({ frequency: 'daily', startDate: '2026-01-01' }),
      null,
      '2026-01-05',
    );
    expect(dates).toHaveLength(5);
  });
});
