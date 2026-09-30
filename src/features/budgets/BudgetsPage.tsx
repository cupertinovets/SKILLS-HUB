import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Budget } from '@/models/types';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { computeBudgetProgress } from '@/lib/analytics';
import { monthRange, weekRange } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import { BudgetForm } from './BudgetForm';

export function BudgetsPage() {
  const data = useAppStore((s) => s.data);
  const addBudget = useAppStore((s) => s.addBudget);
  const updateBudget = useAppStore((s) => s.updateBudget);
  const deleteBudget = useAppStore((s) => s.deleteBudget);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | undefined>();
  const [pendingDelete, setPendingDelete] = useState<Budget | undefined>();

  const categoryById = useMemo(
    () => new Map(data.categories.map((c) => [c.id, c])),
    [data.categories],
  );

  const progress = useMemo(() => {
    const now = new Date();
    return data.budgets.map((budget) => {
      const range = budget.period === 'week' ? weekRange(now, data.settings.startOfWeek) : monthRange(now);
      return computeBudgetProgress(budget, data.transactions, range);
    });
  }, [data.budgets, data.transactions, data.settings.startOfWeek]);

  return (
    <>
      <PageHeader
        title="Бюджеты и лимиты"
        subtitle="Контроль расходов по категориям и общий лимит"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            Добавить лимит
          </Button>
        }
      />

      {progress.length === 0 ? (
        <EmptyState message="Лимиты не заданы" />
      ) : (
        <Stack spacing={2}>
          {progress.map(({ budget, spent, ratio, exceeded }) => {
            const category = budget.categoryId ? categoryById.get(budget.categoryId) : null;
            const label = category?.name ?? 'Общий лимит';
            const color = exceeded ? 'error' : ratio > 0.8 ? 'warning' : 'success';
            return (
              <Card key={budget.id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6">{label}</Typography>
                      <Chip
                        size="small"
                        label={budget.period === 'month' ? 'месяц' : 'неделя'}
                      />
                      {exceeded && <Chip size="small" color="error" label="Превышен" />}
                    </Stack>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(budget);
                          setFormOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setPendingDelete(budget)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Stack>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(ratio * 100, 100)}
                      color={color}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Израсходовано: {formatCurrency(spent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Лимит: {formatCurrency(budget.limit)} ({Math.round(ratio * 100)}%)
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      <BudgetForm
        open={formOpen}
        initial={editing}
        categories={data.categories}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSubmit={(values) => {
          if (editing) updateBudget(editing.id, values);
          else addBudget(values);
          setFormOpen(false);
          setEditing(undefined);
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Удалить лимит?"
        onClose={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (pendingDelete) deleteBudget(pendingDelete.id);
        }}
      />
    </>
  );
}
