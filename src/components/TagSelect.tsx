import { Autocomplete, Chip, TextField } from '@mui/material';

export function TagSelect({
  value,
  onChange,
  options,
  label = 'Теги',
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  options: string[];
  label?: string;
}) {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={value}
      onChange={(_, next) => onChange(next.map((v) => String(v).trim()).filter(Boolean))}
      renderTags={(items, getTagProps) =>
        items.map((option, index) => (
          <Chip
            variant="outlined"
            label={option}
            size="small"
            {...getTagProps({ index })}
            key={option}
          />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Добавить тег и нажать Enter" />
      )}
    />
  );
}
