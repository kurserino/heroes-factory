import { Alert, CircularProgress, Stack, Typography } from '@mui/material';

export function HeroListLoading() {
  return (
    <Stack alignItems="center" py={6} data-testid="hero-list-loading">
      <CircularProgress aria-label="Loading heroes" />
    </Stack>
  );
}

export function HeroListEmpty() {
  return (
    <Stack alignItems="center" py={6} data-testid="hero-list-empty">
      <Typography variant="body1" color="text.secondary">
        No heroes yet. Create your first hero to get started.
      </Typography>
    </Stack>
  );
}

export function HeroListNoResults({ search }: { search: string }) {
  return (
    <Stack alignItems="center" py={6} data-testid="hero-list-no-results">
      <Typography variant="body1" color="text.secondary">
        No heroes match &ldquo;{search}&rdquo;.
      </Typography>
    </Stack>
  );
}

export function HeroListError() {
  return (
    <Alert severity="error" data-testid="hero-list-error">
      Something went wrong while loading heroes. Please try again.
    </Alert>
  );
}
