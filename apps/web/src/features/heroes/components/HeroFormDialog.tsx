import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useCreateHeroMutation, useUpdateHeroMutation } from '../api/heroesQueries';
import { ApiError } from '../../../lib/apiClient';
import { HeroFormValues, heroFormSchema } from '../schemas/heroFormSchema';
import { Hero } from '../types/hero';

export type HeroFormMode = { type: 'create' } | { type: 'edit'; hero: Hero };

interface HeroFormDialogProps {
  state: HeroFormMode | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const emptyValues: HeroFormValues = {
  name: '',
  nickname: '',
  date_of_birth: '',
  universe: '',
  main_power: '',
  avatar_url: '',
};

function toFormValues(hero: Hero): HeroFormValues {
  return {
    name: hero.name,
    nickname: hero.nickname,
    date_of_birth: hero.date_of_birth,
    universe: hero.universe,
    main_power: hero.main_power,
    avatar_url: hero.avatar_url,
  };
}

export function HeroFormDialog({ state, onClose, onSuccess, onError }: HeroFormDialogProps) {
  const isEdit = state?.type === 'edit';
  const createMutation = useCreateHeroMutation();
  const updateMutation = useUpdateHeroMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: emptyValues,
  });

  const formInstanceKey =
    state === null ? null : state.type === 'edit' ? state.hero.id : 'create';

  // Re-initialize the form whenever a new dialog instance opens (create, or
  // a different hero to edit) — but never as a side effect of a failed
  // submission, so failed values remain visible (FR-019).
  useEffect(() => {
    if (state === null) {
      return;
    }
    reset(state.type === 'edit' ? toFormValues(state.hero) : emptyValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formInstanceKey]);

  function handleClose(): void {
    if (isPending) {
      return;
    }
    onClose();
  }

  const onSubmit = handleSubmit((values) => {
    if (state === null) {
      return;
    }

    const mutation =
      state.type === 'create'
        ? createMutation.mutateAsync(values)
        : updateMutation.mutateAsync({ id: state.hero.id, data: values });

    mutation
      .then(() => {
        onSuccess(state.type === 'create' ? 'Hero created.' : 'Hero updated.');
        onClose();
      })
      .catch((error: unknown) => {
        const message = error instanceof ApiError ? error.message : 'Something went wrong.';
        onError(message);
      });
  });

  return (
    <Dialog open={state !== null} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Hero' : 'Create Hero'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} py={1}>
            {isEdit && (
              <Typography variant="caption" color="text.secondary">
                Status: {state.hero.is_active ? 'Active' : 'Inactive'} · Created:{' '}
                {state.hero.created_at}
              </Typography>
            )}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isPending}
                  fullWidth
                />
              )}
            />
            <Controller
              name="nickname"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nickname"
                  error={!!errors.nickname}
                  helperText={errors.nickname?.message}
                  disabled={isPending}
                  fullWidth
                />
              )}
            />
            <Controller
              name="date_of_birth"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Date of birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date_of_birth}
                  helperText={errors.date_of_birth?.message}
                  disabled={isPending}
                  fullWidth
                />
              )}
            />
            <Controller
              name="universe"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Universe"
                  error={!!errors.universe}
                  helperText={errors.universe?.message}
                  disabled={isPending}
                  fullWidth
                />
              )}
            />
            <Controller
              name="main_power"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Main power"
                  error={!!errors.main_power}
                  helperText={errors.main_power?.message}
                  disabled={isPending}
                  fullWidth
                />
              )}
            />
            <Controller
              name="avatar_url"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Avatar URL"
                  error={!!errors.avatar_url}
                  helperText={errors.avatar_url?.message}
                  disabled={isPending}
                  fullWidth
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isEdit ? 'Save changes' : 'Create hero'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
