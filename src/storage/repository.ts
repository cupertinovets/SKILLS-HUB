import type { AppData } from '@/models/types';

export interface DataRepository {
  load(): AppData | null;
  save(data: AppData): void;
  clear(): void;
}

export const STORAGE_KEY = 'finance-tracker:data';
