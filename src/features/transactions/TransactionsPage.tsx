import {
  Box,
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
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import { useMemo, useState } from 'react';
import { useAppStore, type NewTransactionInput } from '@/store/useAppStore';
import type { Transaction } from '@/models/types';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/app/snackbar';
import { allTags } from '@/lib/analytics';
import { formatSignedAmount } from '@/lib/format';
import { formatDisplayDate } from '@/lib/date';
import { transactionsToCsv } from '@/lib/csv';
import { TransactionForm } from './TransactionForm';
import {
  EMPTY_FILTERS,
  TransactionFilters,
  type FiltersState,
} from './TransactionFilters';

type SortKey = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

export function TransactionsPage() {
  const data = useAppStore((s) => s.data);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const { notify } = useSnackbar();

  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [pendingDelete, setPendingDelete] = useState<Transaction | undefined>();

  const categoryById = useMemo(
    () => new Map(data.categories.map((c) => [c.id, c])),
    [data.categories],
  );

  const filtered = useMemo(() => {
    const min = filters.minAmount ? Number(filters.minAmount) : null;
    const max = filters.maxAmount ? Number(filters.maxAmount) : null;
    return data.transactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.categoryId !== 'all' && t.categoryId !== filters.categoryId) return false;
      if (filters.from && t.date < filters.from) return false;
      if (filters.to && t.date > filters.to) return false;
      if (min !== null && t.amount < min) return false;
      if (max !== null && t.amount > max) return false;
      if (filters.tag && !t.tags.includes(filters.tag)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesNote = (t.note ?? '').toLowerCase().includes(q);
        const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesNote && !matchesTags) return false;
      }
      return true;
    });
  }, [data.transactions, filters]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'amount') return (a.amount - b.amount) * dir;
      return a.date.localeCompare(b.date) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const paged = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const tags = useMemo(() => allTags(data.transactions), [data.transactions]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleChange = (patch: Partial<FiltersState>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(0);
  };

  const handleSubmit = (values: NewTransactionInput) => {
    if (editing) {
      updateTransaction(editing.id, values);
      notify('Операция обновлена', 'success');
    } else {
      addTransaction(values);
      notify('Операция добавлена', 'success');
    }
    setFormOpen(false);
    setEditing(undefined);
  };

  const exportCsv = () => {
    const csv = transactionsToCsv(sorted, data.categories);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Операции"
        subtitle={`Найдено операций: ${filtered.length}`}
        action={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!sorted.length}>
              Экспорт CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
            >
              Добавить
            </Button>
          </Stack>
        }
      />

      <TransactionFilters
        filters={filters}
        categories={data.categories}
        tags={tags}
        onChange={handleChange}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      <Paper variant="outlined">
        {sorted.length === 0 ? (
          <EmptyState message="Операций не найдено" />
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sortDirection={sortKey === 'date' ? sortDir : false}>
                      <TableSortLabel
                        active={sortKey === 'date'}
                        direction={sortKey === 'date' ? sortDir : 'desc'}
                        onClick={() => handleSort('date')}
                      >
                        Дата
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Комментарий</TableCell>
                    <TableCell>Теги</TableCell>
                    <TableCell align="right" sortDirection={sortKey === 'amount' ? sortDir : false}>
                      <TableSortLabel
                        active={sortKey === 'amount'}
                        direction={sortKey === 'amount' ? sortDir : 'desc'}
                        onClick={() => handleSort('amount')}
                      >
                        Сумма
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((t) => {
                    const category = categoryById.get(t.categoryId);
                    return (
                      <TableRow key={t.id} hover>
                        <TableCell>{formatDisplayDate(t.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={category?.name ?? 'Без категории'}
                            size="small"
                            sx={{
                              bgcolor: category?.color ?? '#9e9e9e',
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {t.note || (t.isRecurring ? 'Повторяющаяся операция' : '—')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {t.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: t.type === 'income' ? 'success.main' : 'error.main' }}
                        >
                          {formatSignedAmount(t.amount, t.type)}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditing(t);
                                setFormOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton size="small" onClick={() => setPendingDelete(t)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={sorted.length}
              page={page}
              onPageChange={(_, next) => setPage(next)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[25, 50, 100]}
              labelRowsPerPage="Строк на странице"
            />
          </>
        )}
      </Paper>

      <Box sx={{ mt: 2 }} />

      <TransactionForm
        open={formOpen}
        initial={editing}
        categories={data.categories}
        transactions={data.transactions}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Удалить операцию?"
        message="Действие нельзя отменить."
        onClose={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteTransaction(pendingDelete.id);
            notify('Операция удалена', 'info');
          }
        }}
      />
    </>
  );
}
