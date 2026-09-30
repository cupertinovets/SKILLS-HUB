const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return rubFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatSignedAmount(value: number, type: 'income' | 'expense'): string {
  const sign = type === 'income' ? '+' : '−';
  return `${sign}${formatCurrency(value)}`;
}
