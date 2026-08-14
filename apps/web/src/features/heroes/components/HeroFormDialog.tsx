import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { forwardRef, useEffect } from 'react';
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

// A traditional static label rendered above the input, rather than MUI's
// default outlined-variant floating/notched label. Renders a plain <label>
// associated to the input via htmlFor/id.
interface LabeledTextFieldProps extends Omit<TextFieldProps, 'label'> {
  fieldLabel: string;
  id: string;
}

const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  function LabeledTextField({ fieldLabel, id, ...textFieldProps }, ref) {
    return (
      <Stack spacing={0.5}>
        <Typography component="label" htmlFor={id} variant="body2" fontWeight={500}>
          {fieldLabel}
        </Typography>
        <TextField id={id} inputRef={ref} size="small" {...textFieldProps} />
      </Stack>
    );
  },
);

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

  const formInstanceKey = state === null ? null : state.type === 'edit' ? state.hero.id : 'create';

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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isEdit ? 'Edit Hero' : 'Create Hero'}
        <IconButton aria-label="Close" onClick={handleClose} disabled={isPending} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} py={1}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <LabeledTextField
                  {...field}
                  id="hero-name"
                  fieldLabel="Name"
                  placeholder="Enter the full name"
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
                <LabeledTextField
                  {...field}
                  id="hero-nickname"
                  fieldLabel="Nickname"
                  placeholder="Enter the nickname"
                  error={!!errors.nickname}
                  helperText={errors.nickname?.message}
                  disabled={isPending}
                  fullWidth
                />
              )}
            />
            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue: Dayjs | null) =>
                        field.onChange(
                          newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '',
                        )
                      }
                      format="DD/MM/YYYY"
                      disabled={isPending}
                      slots={{ textField: LabeledTextField }}
                      slotProps={{
                        textField: {
                          id: 'hero-date-of-birth',
                          fieldLabel: 'Date of birth',
                          placeholder: 'Enter the date',
                          error: !!errors.date_of_birth,
                          helperText: errors.date_of_birth?.message,
                          fullWidth: true,
                          name: field.name,
                          onBlur: field.onBlur,
                          inputRef: field.ref,
                        } as LabeledTextFieldProps,
                      }}
                    />
                  )}
                />
              </Box>
              <Box flex={1}>
                <Controller
                  name="universe"
                  control={control}
                  render={({ field }) => (
                    <LabeledTextField
                      {...field}
                      id="hero-universe"
                      fieldLabel="Universe"
                      placeholder="Enter the universe"
                      error={!!errors.universe}
                      helperText={errors.universe?.message}
                      disabled={isPending}
                      fullWidth
                    />
                  )}
                />
              </Box>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                <Controller
                  name="main_power"
                  control={control}
                  render={({ field }) => (
                    <LabeledTextField
                      {...field}
                      id="hero-main-power"
                      fieldLabel="Main power"
                      placeholder="Enter the main power"
                      error={!!errors.main_power}
                      helperText={errors.main_power?.message}
                      disabled={isPending}
                      fullWidth
                    />
                  )}
                />
              </Box>
              <Box flex={1}>
                <Controller
                  name="avatar_url"
                  control={control}
                  render={({ field }) => (
                    <LabeledTextField
                      {...field}
                      id="hero-avatar-url"
                      fieldLabel="Avatar URL"
                      placeholder="Enter the URL"
                      error={!!errors.avatar_url}
                      helperText={errors.avatar_url?.message}
                      disabled={isPending}
                      fullWidth
                    />
                  )}
                />
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ justifyContent: 'center', px: 4, py: 3 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>
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
