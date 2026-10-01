import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useForm } from 'react-hook-form';
import { MoneyField } from '@/components/MoneyField';

function Harness({ onValue }: { onValue: (value: number) => void }) {
  const { register, watch } = useForm<{ amount: number }>({ defaultValues: { amount: 0 } });
  const value = watch('amount');
  onValue(value);
  return (
    <form>
      <MoneyField label="Сумма" {...register('amount', { valueAsNumber: true })} />
    </form>
  );
}

describe('MoneyField', () => {
  it('регистрирует ввод в react-hook-form через ref', () => {
    let latest: number | undefined;
    render(<Harness onValue={(v) => (latest = v)} />);

    fireEvent.change(screen.getByLabelText('Сумма'), { target: { value: '123' } });

    expect(latest).toBe(123);
  });
});
