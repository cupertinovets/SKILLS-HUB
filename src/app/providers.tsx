import { ThemeProvider, CssBaseline } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import { buildTheme } from '@/theme';
import { useColorMode } from '@/hooks/useColorMode';
import { SnackbarProvider } from '@/app/snackbar';

export function AppProviders({ children }: { children: ReactNode }) {
  const mode = useColorMode();
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>{children}</SnackbarProvider>
    </ThemeProvider>
  );
}
