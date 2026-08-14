import SearchIcon from '@mui/icons-material/Search';
import { Button, InputAdornment, Stack, TextField } from '@mui/material';
import { FormEvent, useState } from 'react';

interface HeroSearchProps {
  initialValue: string;
  onSubmit: (value: string) => void;
}

// Explicit submit only (Enter key or the Search button) — no live-as-you-type
// filtering, per the spec's clarification session. The magnifying-glass icon
// inside the input is purely illustrative; the actual submit trigger is the
// Search button outside the input.
export function HeroSearch({ initialValue, onSubmit }: HeroSearchProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmit(value.trim());
  }

  return (
    <Stack component="form" direction="row" spacing={1} onSubmit={handleSubmit} role="search">
      <TextField
        placeholder="Search by name or nickname"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        size="small"
        fullWidth
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
        inputProps={{ 'aria-label': 'Search heroes' }}
      />
      <Button
        type="submit"
        variant="outlined"
        sx={{ bgcolor: 'background.paper', borderRadius: 999 }}
      >
        Search
      </Button>
    </Stack>
  );
}
