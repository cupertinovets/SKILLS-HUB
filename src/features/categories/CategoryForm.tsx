import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
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
import type { Category } from '@/models/types';
import { categoryFormSchema } from '@/models/schemas';
import { CATEGORY_COLORS } from '@/models/defaults';

type FormValues = z.infer<typeof categoryFormSchema>;

export function CategoryForm({
  open,
  initial,
  defaultType,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: Category;
  defaultType: 'income' | 'expense';
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initial
      ? { name: initial.name, type: initial.type, color: initial.color, icon: initial.icon ?? '' }
      : { name: '', type: defaultType, color: CATEGORY_COLORS[0], icon: '' },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{initial ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
              fullWidth
            />
            <TextField select label="Тип" defaultValue={defaultType} {...register('type')} fullWidth>
              <MenuItem value="expense">Расход</MenuItem>
              <MenuItem value="income">Доход</MenuItem>
            </TextField>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {CATEGORY_COLORS.map((color) => (
                    <Box
                      key={color}
                      onClick={() => field.onChange(color)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: color,
                        cursor: 'pointer',
                        outline: field.value === color ? '2px solid' : 'none',
                        outlineColor: 'text.primary',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </Box>
              )}
            />
            <TextField label="Иконка (необязательно)" {...register('icon')} fullWidth />
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
