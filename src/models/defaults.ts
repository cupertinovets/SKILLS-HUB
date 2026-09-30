import type { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Зарплата', type: 'income', color: '#2e7d32', icon: 'Payments', isDefault: true },
  { id: 'cat-freelance', name: 'Фриланс', type: 'income', color: '#43a047', icon: 'Work', isDefault: true },
  { id: 'cat-gift', name: 'Подарки', type: 'income', color: '#66bb6a', icon: 'CardGiftcard', isDefault: true },
  { id: 'cat-other-income', name: 'Прочие доходы', type: 'income', color: '#81c784', icon: 'AddCircle', isDefault: true },

  { id: 'cat-food', name: 'Продукты', type: 'expense', color: '#ef5350', icon: 'Restaurant', isDefault: true },
  { id: 'cat-transport', name: 'Транспорт', type: 'expense', color: '#42a5f5', icon: 'DirectionsCar', isDefault: true },
  { id: 'cat-home', name: 'Жильё', type: 'expense', color: '#8d6e63', icon: 'Home', isDefault: true },
  { id: 'cat-health', name: 'Здоровье', type: 'expense', color: '#26a69a', icon: 'LocalHospital', isDefault: true },
  { id: 'cat-entertainment', name: 'Развлечения', type: 'expense', color: '#ab47bc', icon: 'Movie', isDefault: true },
  { id: 'cat-shopping', name: 'Покупки', type: 'expense', color: '#ffa726', icon: 'ShoppingBag', isDefault: true },
  { id: 'cat-utilities', name: 'Коммунальные', type: 'expense', color: '#5c6bc0', icon: 'Bolt', isDefault: true },
  { id: 'cat-other-expense', name: 'Прочие расходы', type: 'expense', color: '#78909c', icon: 'MoreHoriz', isDefault: true },
];

export const CATEGORY_COLORS = [
  '#ef5350',
  '#ec407a',
  '#ab47bc',
  '#7e57c2',
  '#5c6bc0',
  '#42a5f5',
  '#29b6f6',
  '#26a69a',
  '#66bb6a',
  '#9ccc65',
  '#ffa726',
  '#ff7043',
  '#8d6e63',
  '#78909c',
];
