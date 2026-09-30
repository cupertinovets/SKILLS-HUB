import { useMediaQuery } from '@mui/material';
import { useAppStore } from '@/store/useAppStore';

export function useColorMode(): 'light' | 'dark' {
  const theme = useAppStore((s) => s.data.settings.theme);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}
