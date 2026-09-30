import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Category } from '@/models/types';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CategoryForm } from './CategoryForm';
import { useSnackbar } from '@/app/snackbar';

export function CategoriesPage() {
  const data = useAppStore((s) => s.data);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const deleteCategory = useAppStore((s) => s.deleteCategory);
  const { notify } = useSnackbar();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [pendingDelete, setPendingDelete] = useState<Category | undefined>();
  const [reassignTarget, setReassignTarget] = useState<string>('');

  const usageCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of data.transactions) {
      counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [data.transactions]);

  const affectedCount = pendingDelete ? (usageCount.get(pendingDelete.id) ?? 0) : 0;
  const reassignOptions = data.categories.filter(
    (c) => c.id !== pendingDelete?.id && c.type === pendingDelete?.type,
  );

  const incomeCategories = data.categories.filter((c) => c.type === 'income');
  const expenseCategories = data.categories.filter((c) => c.type === 'expense');

  const renderTable = (categories: Category[], title: string, type: 'income' | 'expense') => (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 3, mb: 1 }}
      >
        <Typography variant="h6">{title}</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          data-default-type={type}
        >
          Добавить
        </Button>
      </Stack>
      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Цвет</TableCell>
                <TableCell align="right">Операций</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>{c.name}</Typography>
                      {c.isDefault && <Chip label="встроенная" size="small" />}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={c.color} size="small" sx={{ bgcolor: c.color, color: '#fff' }} />
                  </TableCell>
                  <TableCell align="right">{usageCount.get(c.id) ?? 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Редактировать">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(c);
                          setFormOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton size="small" onClick={() => setPendingDelete(c)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );

  return (
    <>
      <PageHeader title="Категории" subtitle="Управление категориями доходов и расходов" />

      {renderTable(expenseCategories, 'Расходы', 'expense')}
      {renderTable(incomeCategories, 'Доходы', 'income')}

      <CategoryForm
        open={formOpen}
        initial={editing}
        defaultType={editing?.type ?? 'expense'}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSubmit={(values) => {
          if (editing) {
            updateCategory(editing.id, values);
            notify('Категория обновлена', 'success');
          } else {
            addCategory(values);
            notify('Категория добавлена', 'success');
          }
          setFormOpen(false);
          setEditing(undefined);
        }}
      />

      {pendingDelete && affectedCount > 0 ? (
        <Dialog open onClose={() => setPendingDelete(undefined)} maxWidth="xs" fullWidth>
          <DialogTitle>Перенос операций</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              К категории «{pendingDelete.name}» привязано операций: {affectedCount}. Выберите
              категорию для переноса перед удалением.
            </DialogContentText>
            <TextField
              select
              fullWidth
              label="Перенести в"
              value={reassignTarget}
              onChange={(e) => setReassignTarget(e.target.value)}
            >
              {reassignOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPendingDelete(undefined)}>Отмена</Button>
            <Button
              color="error"
              variant="contained"
              disabled={!reassignTarget}
              onClick={() => {
                deleteCategory(pendingDelete.id, reassignTarget);
                notify('Категория удалена, операции перенесены', 'info');
                setPendingDelete(undefined);
                setReassignTarget('');
              }}
            >
              Удалить и перенести
            </Button>
          </DialogActions>
        </Dialog>
      ) : (
        <ConfirmDialog
          open={!!pendingDelete}
          title="Удалить категорию?"
          message="Категория не используется в операциях."
          onClose={() => setPendingDelete(undefined)}
          onConfirm={() => {
            if (pendingDelete) {
              deleteCategory(pendingDelete.id);
              notify('Категория удалена', 'info');
            }
          }}
        />
      )}
    </>
  );
}
