import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import type { ReactNode } from 'react';

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        py: 6,
        color: 'text.secondary',
      }}
    >
      <InboxIcon fontSize="large" />
      <Typography>{message}</Typography>
      {action}
    </Box>
  );
}
