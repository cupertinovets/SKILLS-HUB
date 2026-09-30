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
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Category, Transaction } from '@/models/types';
import { transactionFormSchema } from '@/models/schemas';
import { MoneyField } from '@/components/MoneyField';
import { TagSelect } from '@/components/TagSelect';
import { allTags } from '@/lib/analytics';
import { toISODate } from '@/lib/date';

type FormValues = z.infer<typeof transactionFormSchema>;

export function TransactionForm({
  open,
  initial,
  categories,
  transactions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: Transaction;
  categories: Category[];
  transactions: Transaction[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: initial
      ? {
          type: initial.type,
          amount: initial.amount,
          categoryId: initial.categoryId,
          date: initial.date,
          note: initial.note ?? '',
          tags: initial.tags,
        }
      : {
          type: 'expense',
          amount: 0,
          categoryId: '',
          date: toISODate(new Date()),
          note: '',
          tags: [],
        },
  });

  const type = watch('type');
  const availableCategories = categories.filter((c) => c.type === type);
  const tagOptions = allTags(transactions);

  useEffect(() => {
    if (!open) return;
    reset(
      initial
        ? {
            type: initial.type,
            amount: initial.amount,
            categoryId: initial.categoryId,
            date: initial.date,
            note: initial.note ?? '',
            tags: initial.tags,
          }
        : {
            type: 'expense',
            amount: 0,
            categoryId: '',
            date: toISODate(new Date()),
            note: '',
            tags: [],
          },
    );
  }, [open, initial, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{initial ? 'Редактировать операцию' : 'Новая операция'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Тип"
              defaultValue="expense"
              {...register('type')}
              fullWidth
            >
              <MenuItem value="expense">Расход</MenuItem>
              <MenuItem value="income">Доход</MenuItem>
            </TextField>

            <TextField select label="Категория" {...register('categoryId')} fullWidth
              error={!!errors.categoryId} helperText={errors.categoryId?.message}>
              {availableCategories.map((c) => (
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

            <TextField
              type="date"
              label="Дата"
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date?.message}
              {...register('date')}
              fullWidth
            />

            <TextField label="Комментарий" {...register('note')} fullWidth multiline rows={2} />

            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagSelect value={field.value} onChange={field.onChange} options={tagOptions} />
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
