import { Alert, CircularProgress, Stack, Typography } from '@mui/material';

export function HeroListLoading() {
  return (
    <Stack alignItems="center" py={6} data-testid="hero-list-loading">
      <CircularProgress aria-label="Carregando heróis" />
    </Stack>
  );
}

export function HeroListEmpty() {
  return (
    <Stack alignItems="center" py={6} data-testid="hero-list-empty">
      <Typography variant="body1" color="text.secondary">
        Nenhum herói ainda. Crie seu primeiro herói para começar.
      </Typography>
    </Stack>
  );
}

export function HeroListNoResults({ search }: { search: string }) {
  return (
    <Stack alignItems="center" py={6} data-testid="hero-list-no-results">
      <Typography variant="body1" color="text.secondary">
        Nenhum herói encontrado para &ldquo;{search}&rdquo;.
      </Typography>
    </Stack>
  );
}

export function HeroListError() {
  return (
    <Alert severity="error" data-testid="hero-list-error">
      Algo deu errado ao carregar os heróis. Tente novamente.
    </Alert>
  );
}
