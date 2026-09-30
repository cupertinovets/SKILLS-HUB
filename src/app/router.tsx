import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/app/Layout';
import { DashboardPage } from '@/features/reports/DashboardPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';
import { CategoriesPage } from '@/features/categories/CategoriesPage';
import { BudgetsPage } from '@/features/budgets/BudgetsPage';
import { RecurringPage } from '@/features/recurring/RecurringPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'budgets', element: <BudgetsPage /> },
      { path: 'recurring', element: <RecurringPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
