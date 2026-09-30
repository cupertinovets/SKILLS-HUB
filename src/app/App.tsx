import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { router } from '@/app/router';
import { useAppStore } from '@/store/useAppStore';
import { useSnackbar } from '@/app/snackbar';

function RecurringGenerator() {
  const generate = useAppStore((s) => s.generatePendingTransactions);
  const { notify } = useSnackbar();

  useEffect(() => {
    const created = generate();
    if (created > 0) {
      notify(`Сгенерировано повторяющихся операций: ${created}`, 'success');
    }
    // Запускаем один раз при старте приложения.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function App() {
  return (
    <AppProviders>
      <RecurringGenerator />
      <RouterProvider router={router} />
    </AppProviders>
  );
}
