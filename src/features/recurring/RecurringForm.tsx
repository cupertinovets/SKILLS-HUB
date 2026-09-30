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
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import type { Category, RecurringRule, Transaction } from '@/models/types';
import { recurringFormSchema } from '@/models/schemas';
import { MoneyField } from '@/components/MoneyField';
import { TagSelect } from '@/components/TagSelect';
import { allTags } from '@/lib/analytics';
import { toISODate } from '@/lib/date';

type FormValues = z.infer<typeof recurringFormSchema>;

export function RecurringForm({
  open,
  initial,
  categories,
  allTransactions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: RecurringRule;
  categories: Category[];
  allTransactions: Transaction[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: initial
      ? {
          type: initial.type,
          amount: initial.amount,
          categoryId: initial.categoryId,
          note: initial.note ?? '',
          tags: initial.tags,
          frequency: initial.frequency,
          startDate: initial.startDate,
          endDate: initial.endDate ?? '',
        }
      : {
          type: 'expense',
          amount: 0,
          categoryId: '',
          note: '',
          tags: [],
          frequency: 'monthly',
          startDate: toISODate(new Date()),
          endDate: '',
        },
  });

  const type = watch('type');
  const options = categories.filter((c) => c.type === type);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {initial ? 'Редактировать правило' : 'Новое правило повтора'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Тип" defaultValue="expense" {...register('type')} fullWidth>
              <MenuItem value="expense">Расход</MenuItem>
              <MenuItem value="income">Доход</MenuItem>
            </TextField>
            <TextField select label="Категория" {...register('categoryId')} fullWidth
              error={!!errors.categoryId} helperText={errors.categoryId?.message}>
              {options.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <MoneyField
              label="Сумма"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
              fullWidth
            />
            <TextField select label="Периодичность" defaultValue="monthly" {...register('frequency')} fullWidth>
              <MenuItem value="daily">Ежедневно</MenuItem>
              <MenuItem value="weekly">Еженедельно</MenuItem>
              <MenuItem value="monthly">Ежемесячно</MenuItem>
              <MenuItem value="yearly">Ежегодно</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Дата начала"
              InputLabelProps={{ shrink: true }}
              {...register('startDate')}
              fullWidth
            />
            <TextField
              type="date"
              label="Дата окончания (необязательно)"
              InputLabelProps={{ shrink: true }}
              {...register('endDate', {
                setValueAs: (v) => (v === '' ? undefined : v),
              })}
              fullWidth
            />
            <TextField label="Комментарий" {...register('note')} fullWidth />
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={allTags(allTransactions)}
                />
              )}
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
