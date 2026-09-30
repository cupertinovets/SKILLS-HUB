import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { AppData, Settings } from '@/models/types';
import { importValidationSchema } from '@/models/schemas';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/app/snackbar';
import { transactionsToCsv } from '@/lib/csv';

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SettingsPage() {
  const data = useAppStore((s) => s.data);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const importData = useAppStore((s) => s.importData);
  const resetData = useAppStore((s) => s.resetData);
  const { notify } = useSnackbar();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJson = () => {
    download(
      `finance-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      'application/json',
    );
    notify('Резервная копия сохранена', 'success');
  };

  const exportCsv = () => {
    const csv = transactionsToCsv(data.transactions, data.categories);
    download(
      `operations-${new Date().toISOString().slice(0, 10)}.csv`,
      `\uFEFF${csv}`,
      'text/csv;charset=utf-8',
    );
    notify('CSV сохранён', 'success');
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = importValidationSchema.safeParse(parsed);
      if (!result.success) {
        notify('Файл повреждён или имеет неверный формат', 'error');
        return;
      }
      setPendingImport(result.data);
    } catch {
      notify('Не удалось прочитать файл', 'error');
    }
  };

  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    updateSettings({ [key]: value } as Partial<Settings>);
  };

  return (
    <>
      <PageHeader title="Настройки" subtitle="Тема, локализация и управление данными" />

      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Внешний вид
            </Typography>
            <Stack spacing={2} sx={{ maxWidth: 360 }}>
              <TextField
                select
                label="Тема"
                value={data.settings.theme}
                onChange={(e) => setSetting('theme', e.target.value as Settings['theme'])}
                fullWidth
              >
                <MenuItem value="light">Светлая</MenuItem>
                <MenuItem value="dark">Тёмная</MenuItem>
                <MenuItem value="system">Системная</MenuItem>
              </TextField>
              <TextField
                select
                label="Начало недели"
                value={data.settings.startOfWeek}
                onChange={(e) => setSetting('startOfWeek', Number(e.target.value) as 0 | 1)}
                fullWidth
              >
                <MenuItem value={1}>Понедельник</MenuItem>
                <MenuItem value={0}>Воскресенье</MenuItem>
              </TextField>
              <TextField label="Валюта" value="₽ Рубль" disabled fullWidth />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Данные
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Все данные хранятся локально в браузере. Регулярно делайте резервные копии.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button startIcon={<DownloadIcon />} variant="outlined" onClick={exportJson}>
                Экспорт JSON (бэкап)
              </Button>
              <Button startIcon={<TableViewIcon />} variant="outlined" onClick={exportCsv}>
                Экспорт CSV
              </Button>
              <Button
                startIcon={<UploadFileIcon />}
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
              >
                Импорт JSON
              </Button>
              <Button
                startIcon={<DeleteForeverIcon />}
                color="error"
                variant="outlined"
                onClick={() => setConfirmReset(true)}
              >
                Сбросить данные
              </Button>
            </Stack>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Операций: {data.transactions.length} · Категорий: {data.categories.length} · Лимитов:{' '}
              {data.budgets.length} · Правил повтора: {data.recurringRules.length}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={!!pendingImport} onClose={() => setPendingImport(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Импортировать данные?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Текущие данные будут полностью заменены содержимым файла. Продолжить?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingImport(null)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (pendingImport) {
                importData(pendingImport);
                notify('Данные импортированы', 'success');
              }
              setPendingImport(null);
            }}
          >
            Заменить
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmReset}
        title="Сбросить все данные?"
        message="Будут удалены все операции, лимиты и правила. Категории вернутся к встроенным."
        confirmLabel="Сбросить"
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetData();
          notify('Данные сброшены', 'info');
        }}
      />
    </>
  );
}
