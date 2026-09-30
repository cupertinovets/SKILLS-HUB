import type { Category, Transaction } from '@/models/types';
import { dayjs } from './date';
import { formatNumber } from './format';

const HEADERS = ['Дата', 'Тип', 'Категория', 'Сумма', 'Комментарий', 'Теги'];

function escapeCell(value: string): string {
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(transactions: Transaction[], categories: Category[]): string {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const rows = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t) => {
      const category = byId.get(t.categoryId)?.name ?? 'Без категории';
      return [
        dayjs(t.date).format('DD.MM.YYYY'),
        t.type === 'income' ? 'Доход' : 'Расход',
        category,
        formatNumber(t.amount),
        t.note ?? '',
        t.tags.join(', '),
      ]
        .map(escapeCell)
        .join(';');
    });
  return [HEADERS.join(';'), ...rows].join('\n');
}
