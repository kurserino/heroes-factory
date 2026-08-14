import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { FormEvent, useState } from 'react';

interface HeroSearchProps {
  initialValue: string;
  onSubmit: (value: string) => void;
}

// Explicit submit only (Enter key or the search button) — no live-as-you-type
// filtering, per the spec's clarification session.
export function HeroSearch({ initialValue, onSubmit }: HeroSearchProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <TextField
        label="Search heroes"
        placeholder="Search by name or nickname"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit" aria-label="Search">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
}
