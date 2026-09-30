import { MenuItem, Stack, TextField } from '@mui/material';
import type { DateRange } from '@/lib/date';
import { monthRange, todayISO } from '@/lib/date';
import { dayjs } from '@/lib/date';

export type PeriodKind = 'month' | 'quarter' | 'year' | 'custom';

export interface PeriodState {
  kind: PeriodKind;
  range: DateRange;
}

export function defaultPeriod(): PeriodState {
  const now = new Date();
  return { kind: 'month', range: monthRange(now) };
}

export function periodRange(kind: PeriodKind, startOfWeek: 0 | 1): DateRange {
  const now = dayjs();
  void startOfWeek;
  switch (kind) {
    case 'month':
      return monthRange(now);
    case 'quarter': {
      const quarterStartMonth = Math.floor(now.month() / 3) * 3;
      const start = now.month(quarterStartMonth).startOf('month');
      return { from: start.format('YYYY-MM-DD'), to: start.add(2, 'month').endOf('month').format('YYYY-MM-DD') };
    }
    case 'year':
      return { from: now.startOf('year').format('YYYY-MM-DD'), to: now.endOf('year').format('YYYY-MM-DD') };
    default:
      return { from: todayISO(), to: todayISO() };
  }
}

export function PeriodSelect({
  value,
  onChange,
}: {
  value: PeriodState;
  onChange: (next: PeriodState) => void;
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        select
        size="small"
        label="Период"
        value={value.kind}
        onChange={(e) => {
          const kind = e.target.value as PeriodKind;
          onChange({ kind, range: periodRange(kind, 1) });
        }}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="month">Текущий месяц</MenuItem>
        <MenuItem value="quarter">Квартал</MenuItem>
        <MenuItem value="year">Год</MenuItem>
        <MenuItem value="custom">Произвольный</MenuItem>
      </TextField>
      {value.kind === 'custom' && (
        <>
          <TextField
            type="date"
            size="small"
            label="С"
            InputLabelProps={{ shrink: true }}
            value={value.range.from}
            onChange={(e) => onChange({ ...value, range: { ...value.range, from: e.target.value } })}
          />
          <TextField
            type="date"
            size="small"
            label="По"
            InputLabelProps={{ shrink: true }}
            value={value.range.to}
            onChange={(e) => onChange({ ...value, range: { ...value.range, to: e.target.value } })}
          />
        </>
      )}
    </Stack>
  );
}
