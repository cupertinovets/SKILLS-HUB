import { Autocomplete, Button, MenuItem, Stack, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import type { Category } from '@/models/types';

export interface FiltersState {
  search: string;
  type: 'all' | 'income' | 'expense';
  categoryId: string | 'all';
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  tag: string | null;
}

export const EMPTY_FILTERS: FiltersState = {
  search: '',
  type: 'all',
  categoryId: 'all',
  from: '',
  to: '',
  minAmount: '',
  maxAmount: '',
  tag: null,
};

export function TransactionFilters({
  filters,
  categories,
  tags,
  onChange,
  onReset,
}: {
  filters: FiltersState;
  categories: Category[];
  tags: string[];
  onChange: (patch: Partial<FiltersState>) => void;
  onReset: () => void;
}) {
  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Поиск по комментарию"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          size="small"
          fullWidth
        />
        <TextField
          select
          label="Тип"
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value as FiltersState['type'] })}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="income">Доходы</MenuItem>
          <MenuItem value="expense">Расходы</MenuItem>
        </TextField>
        <TextField
          select
          label="Категория"
          value={filters.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">Все категории</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <Autocomplete
          options={tags}
          value={filters.tag}
          onChange={(_, value) => onChange({ tag: value })}
          renderInput={(params) => (
            <TextField {...params} label="Тег" size="small" sx={{ minWidth: 160 }} />
          )}
        />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        <TextField
          type="date"
          label="С даты"
          InputLabelProps={{ shrink: true }}
          value={filters.from}
          onChange={(e) => onChange({ from: e.target.value })}
          size="small"
        />
        <TextField
          type="date"
          label="По дату"
          InputLabelProps={{ shrink: true }}
          value={filters.to}
          onChange={(e) => onChange({ to: e.target.value })}
          size="small"
        />
        <TextField
          type="number"
          label="Сумма от"
          value={filters.minAmount}
          onChange={(e) => onChange({ minAmount: e.target.value })}
          size="small"
        />
        <TextField
          type="number"
          label="Сумма до"
          value={filters.maxAmount}
          onChange={(e) => onChange({ maxAmount: e.target.value })}
          size="small"
        />
        <Button startIcon={<ClearIcon />} onClick={onReset}>
          Сбросить
        </Button>
      </Stack>
    </Stack>
  );
}
