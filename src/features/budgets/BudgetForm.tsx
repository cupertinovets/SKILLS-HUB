import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { Budget, Category } from '@/models/types';
import { budgetFormSchema } from '@/models/schemas';
import { MoneyField } from '@/components/MoneyField';

type FormValues = z.infer<typeof budgetFormSchema>;

export function BudgetForm({
  open,
  initial,
  categories,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: Budget;
  categories: Category[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: initial
      ? { categoryId: initial.categoryId, period: initial.period, limit: initial.limit }
      : { categoryId: null, period: 'month', limit: 0 },
  });

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{initial ? 'Редактировать лимит' : 'Новый лимит'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Категория"
              defaultValue={initial?.categoryId ?? 'all'}
              {...register('categoryId', {
                setValueAs: (v) => (v === '' || v === 'all' ? null : v),
              })}
              fullWidth
            >
              <MenuItem value="all">Общий лимит (все расходы)</MenuItem>
              {expenseCategories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Период" defaultValue="month" {...register('period')} fullWidth>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="week">Неделя</MenuItem>
            </TextField>
            <MoneyField
              label="Лимит"
              error={!!errors.limit}
              helperText={errors.limit?.message}
              {...register('limit', { valueAsNumber: true })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
