import { InputAdornment, TextField, type TextFieldProps } from '@mui/material';

type MoneyFieldProps = Omit<TextFieldProps, 'type'> & { currency?: string };

export function MoneyField({ currency = '₽', InputProps, ...props }: MoneyFieldProps) {
  return (
    <TextField
      type="number"
      inputProps={{ min: 0, step: '0.01' }}
      InputProps={{
        ...InputProps,
        startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
      }}
      {...props}
    />
  );
}
