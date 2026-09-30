import { createTheme, type Theme } from '@mui/material/styles';

export function buildTheme(mode: 'light' | 'dark'): Theme {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#2e7d32' },
      secondary: { main: '#1565c0' },
      error: { main: '#c62828' },
      background: {
        default: mode === 'light' ? '#f5f6f8' : '#121212',
      },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: [
        'Roboto',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Arial',
        'sans-serif',
      ].join(','),
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: '1px solid',
            borderColor: mode === 'light' ? '#e0e0e0' : '#2a2a2a',
          },
        },
      },
    },
  });
}
