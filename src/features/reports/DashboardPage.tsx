import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { PageHeader } from '@/components/PageHeader';
import { SummaryCard } from '@/components/SummaryCard';
import { EmptyState } from '@/components/EmptyState';
import {
  breakdownByCategory,
  computeTotals,
  dynamicsForRange,
  filterByRange,
} from '@/lib/analytics';
import { formatCurrency } from '@/lib/format';
import { formatDisplayDate } from '@/lib/date';
import { PeriodSelect, defaultPeriod, type PeriodState } from './PeriodSelect';

export function DashboardPage() {
  const data = useAppStore((s) => s.data);
  const [period, setPeriod] = useState<PeriodState>(defaultPeriod);

  const periodTransactions = useMemo(
    () => filterByRange(data.transactions, period.range),
    [data.transactions, period.range],
  );

  const totals = useMemo(() => computeTotals(periodTransactions), [periodTransactions]);
  const allTime = useMemo(() => computeTotals(data.transactions), [data.transactions]);
  const expenseBreakdown = useMemo(
    () => breakdownByCategory(periodTransactions, data.categories, 'expense'),
    [periodTransactions, data.categories],
  );
  const incomeBreakdown = useMemo(
    () => breakdownByCategory(periodTransactions, data.categories, 'income'),
    [periodTransactions, data.categories],
  );
  const dynamics = useMemo(
    () => dynamicsForRange(data.transactions, period.range),
    [data.transactions, period.range],
  );

  const recent = useMemo(
    () => [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [data.transactions],
  );

  const categoryById = useMemo(
    () => new Map(data.categories.map((c) => [c.id, c])),
    [data.categories],
  );

  return (
    <>
      <PageHeader
        title="Дашборд"
        subtitle={`Период: ${formatDisplayDate(period.range.from)} — ${formatDisplayDate(period.range.to)}`}
        action={<PeriodSelect value={period} onChange={setPeriod} />}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard label="Баланс за период" value={formatCurrency(totals.balance)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard label="Доходы за период" value={formatCurrency(totals.income)} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard label="Расходы за период" value={formatCurrency(totals.expense)} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard label="Общий баланс (всё время)" value={formatCurrency(allTime.balance)} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Доходы и расходы за период
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dynamics}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Доходы" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Расходы" fill="#c62828" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динамика баланса
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dynamics}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="balance" name="Баланс" stroke="#1565c0" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Расходы по категориям
              </Typography>
              {expenseBreakdown.length === 0 ? (
                <EmptyState message="Нет расходов за период" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {expenseBreakdown.map((slice) => (
                        <Cell key={slice.categoryId} fill={slice.color} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Доходы по категориям
              </Typography>
              {incomeBreakdown.length === 0 ? (
                <EmptyState message="Нет доходов за период" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomeBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {incomeBreakdown.map((slice) => (
                        <Cell key={slice.categoryId} fill={slice.color} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Последние операции
          </Typography>
          {recent.length === 0 ? (
            <EmptyState message="Операций пока нет" />
          ) : (
            <Stack spacing={1}>
              {recent.map((t) => (
                <Stack
                  key={t.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ minWidth: 90 }}>
                      {formatDisplayDate(t.date)}
                    </Typography>
                    <Typography variant="body2">
                      {categoryById.get(t.categoryId)?.name ?? 'Без категории'}
                    </Typography>
                    {t.note && (
                      <Typography variant="body2" color="text.secondary">
                        {t.note}
                      </Typography>
                    )}
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ color: t.type === 'income' ? 'success.main' : 'error.main' }}
                  >
                    {t.type === 'income' ? '+' : '−'}
                    {formatCurrency(t.amount)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </>
  );
}
