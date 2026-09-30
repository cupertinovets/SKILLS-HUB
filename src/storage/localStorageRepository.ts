import type { AppData } from '@/models/types';
import { appDataSchema } from '@/models/schemas';
import { STORAGE_KEY, type DataRepository } from './repository';

export function createLocalStorageRepository(): DataRepository {
  return {
    load(): AppData | null {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const result = appDataSchema.safeParse(parsed);
        if (!result.success) {
          console.warn('Повреждённые данные в localStorage, используется пустое состояние');
          return null;
        }
        return result.data;
      } catch (error) {
        console.warn('Не удалось прочитать данные из localStorage', error);
        return null;
      }
    },
    save(data: AppData): void {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn('Не удалось сохранить данные в localStorage', error);
      }
    },
    clear(): void {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}
