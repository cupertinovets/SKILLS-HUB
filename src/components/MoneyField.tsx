import { forwardRef } from 'react';
import { InputAdornment, TextField, type TextFieldProps } from '@mui/material';

type MoneyFieldProps = Omit<TextFieldProps, 'type'> & { currency?: string };

export const MoneyField = forwardRef<HTMLInputElement, MoneyFieldProps>(function MoneyField(
  { currency = '₽', InputProps, ...props },
  ref,
) {
  return (
    <TextField
      ref={ref}
      type="number"
      inputProps={{ min: 0, step: '0.01' }}
      InputProps={{
        ...InputProps,
        startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
      }}
      {...props}
    />
  );
});
