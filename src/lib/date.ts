import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/ru';

dayjs.extend(isoWeek);
dayjs.extend(isBetween);
dayjs.locale('ru');

export { dayjs };

export const ISO_DATE = 'YYYY-MM-DD';

export function todayISO(): string {
  return dayjs().format(ISO_DATE);
}

export function toISODate(value: string | Date | dayjs.Dayjs): string {
  return dayjs(value).format(ISO_DATE);
}

export function formatDisplayDate(value: string): string {
  return dayjs(value).format('D MMM YYYY');
}

export function monthKey(value: string | Date | dayjs.Dayjs): string {
  return dayjs(value).format('YYYY-MM');
}

export interface DateRange {
  from: string;
  to: string;
}

export function monthRange(reference: string | Date | dayjs.Dayjs): DateRange {
  const d = dayjs(reference);
  return { from: d.startOf('month').format(ISO_DATE), to: d.endOf('month').format(ISO_DATE) };
}

export function weekRange(
  reference: string | Date | dayjs.Dayjs,
  startOfWeek: 0 | 1 = 1,
): DateRange {
  const d = dayjs(reference);
  const start = startOfWeek === 1 ? d.startOf('isoWeek') : d.startOf('week');
  return { from: start.format(ISO_DATE), to: start.add(6, 'day').format(ISO_DATE) };
}

export function inRange(date: string, range: DateRange): boolean {
  return dayjs(date).isBetween(dayjs(range.from).subtract(1, 'day'), dayjs(range.to).add(1, 'day'));
}
