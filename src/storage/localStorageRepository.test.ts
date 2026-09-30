import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorageRepository } from './localStorageRepository';
import { STORAGE_KEY } from './repository';

describe('createLocalStorageRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('возвращает null при отсутствии данных', () => {
    expect(createLocalStorageRepository().load()).toBeNull();
  });

  it('сохраняет и загружает валидные данные', () => {
    const repo = createLocalStorageRepository();
    const data = {
      transactions: [],
      categories: [
        { id: 'c1', name: 'Продукты', type: 'expense' as const, color: '#f00', isDefault: true },
      ],
      budgets: [],
      recurringRules: [],
      settings: { theme: 'system' as const, currency: 'RUB' as const, startOfWeek: 1 as const },
    };
    repo.save(data);

    const loaded = createLocalStorageRepository().load();
    expect(loaded?.categories).toHaveLength(1);
    expect(loaded?.categories[0].name).toBe('Продукты');
  });

  it('возвращает null при повреждённых данных', () => {
    localStorage.setItem(STORAGE_KEY, '{ broken json');
    expect(createLocalStorageRepository().load()).toBeNull();
  });

  it('возвращает null, если структура не соответствует схеме', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions: 'nope' }));
    expect(createLocalStorageRepository().load()).toBeNull();
  });
});
