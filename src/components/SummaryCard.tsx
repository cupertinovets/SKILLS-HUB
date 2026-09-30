import { Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ color }}>
          {value}
        </Typography>
        {icon}
      </CardContent>
    </Card>
  );
}
