import {
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SyncIcon from '@mui/icons-material/Sync';
import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { RecurringRule } from '@/models/types';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/app/snackbar';
import { formatCurrency } from '@/lib/format';
import { formatDisplayDate } from '@/lib/date';
import { RecurringForm } from './RecurringForm';

const FREQUENCY_LABEL: Record<RecurringRule['frequency'], string> = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
  yearly: 'Ежегодно',
};

export function RecurringPage() {
  const data = useAppStore((s) => s.data);
  const addRule = useAppStore((s) => s.addRecurringRule);
  const updateRule = useAppStore((s) => s.updateRecurringRule);
  const deleteRule = useAppStore((s) => s.deleteRecurringRule);
  const togglePaused = useAppStore((s) => s.toggleRecurringPaused);
  const generate = useAppStore((s) => s.generatePendingTransactions);
  const { notify } = useSnackbar();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringRule | undefined>();
  const [pendingDelete, setPendingDelete] = useState<RecurringRule | undefined>();

  const categoryById = useMemo(
    () => new Map(data.categories.map((c) => [c.id, c])),
    [data.categories],
  );

  return (
    <>
      <PageHeader
        title="Повторяющиеся операции"
        subtitle="Автоматическое создание операций по расписанию"
        action={
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<SyncIcon />}
              onClick={() => {
                const created = generate();
                notify(
                  created > 0 ? `Создано операций: ${created}` : 'Новых операций нет',
                  created > 0 ? 'success' : 'info',
                );
              }}
            >
              Сгенерировать сейчас
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
            >
              Добавить правило
            </Button>
          </Stack>
        }
      />

      <Paper variant="outlined">
        {data.recurringRules.length === 0 ? (
          <EmptyState message="Правил повтора пока нет" />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Категория</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Периодичность</TableCell>
                  <TableCell>Начало</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recurringRules.map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>{categoryById.get(rule.categoryId)?.name ?? '—'}</TableCell>
                    <TableCell>{rule.type === 'income' ? 'Доход' : 'Расход'}</TableCell>
                    <TableCell>{FREQUENCY_LABEL[rule.frequency]}</TableCell>
                    <TableCell>{formatDisplayDate(rule.startDate)}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: rule.type === 'income' ? 'success.main' : 'error.main' }}
                    >
                      {formatCurrency(rule.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={rule.paused ? 'На паузе' : 'Активно'}
                        color={rule.paused ? 'default' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={rule.paused ? 'Возобновить' : 'Пауза'}>
                        <IconButton size="small" onClick={() => togglePaused(rule.id)}>
                          {rule.paused ? (
                            <PlayArrowIcon fontSize="small" />
                          ) : (
                            <PauseIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditing(rule);
                            setFormOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton size="small" onClick={() => setPendingDelete(rule)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {data.recurringRules.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Связанных операций: {data.transactions.filter((t) => t.isRecurring).length}
        </Typography>
      )}

      <RecurringForm
        open={formOpen}
        initial={editing}
        categories={data.categories}
        allTransactions={data.transactions}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSubmit={(values) => {
          if (editing) updateRule(editing.id, values);
          else addRule(values);
          setFormOpen(false);
          setEditing(undefined);
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Удалить правило?"
        message="Все созданные по нему операции также будут удалены."
        onClose={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (pendingDelete) deleteRule(pendingDelete.id);
        }}
      />
    </>
  );
}
