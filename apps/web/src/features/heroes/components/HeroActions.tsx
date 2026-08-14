import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CardActions, IconButton, Stack } from '@mui/material';
import { useState } from 'react';
import { useDeleteHeroMutation } from '../api/heroesQueries';
import { ApiError } from '../../../lib/apiClient';
import { Hero } from '../types/hero';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { HeroStatusToggle } from './HeroStatusToggle';

interface HeroActionsProps {
  hero: Hero;
  onEdit: (hero: Hero) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

// Active heroes expose a status toggle, Edit, and Delete. Inactive heroes
// expose only the status toggle (FR-014) — Edit/Delete simply aren't
// rendered for them.
export function HeroActions({ hero, onEdit, onSuccess, onError }: HeroActionsProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteMutation = useDeleteHeroMutation();

  function confirmDelete(): void {
    deleteMutation.mutate(hero.id, {
      onSuccess: () => {
        onSuccess('Hero deleted.');
        setConfirmingDelete(false);
      },
      onError: (error: unknown) => {
        const message = error instanceof ApiError ? error.message : 'Something went wrong.';
        onError(message);
        setConfirmingDelete(false);
      },
    });
  }

  return (
    <CardActions
      sx={{ justifyContent: 'space-between' }}
      onClick={(event) => event.stopPropagation()}
    >
      <HeroStatusToggle hero={hero} onSuccess={onSuccess} onError={onError} />

      {hero.is_active && (
        <Stack direction="row">
          <IconButton aria-label={`Edit ${hero.name}`} onClick={() => onEdit(hero)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Delete ${hero.name}`}
            onClick={() => setConfirmingDelete(true)}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}

      <DeleteConfirmDialog
        hero={confirmingDelete ? hero : null}
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </CardActions>
  );
}
