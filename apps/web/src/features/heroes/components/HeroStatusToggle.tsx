import { Switch } from '@mui/material';
import { useState } from 'react';
import { useUpdateHeroStatusMutation } from '../api/heroesQueries';
import { ApiError } from '../../../lib/apiClient';
import { Hero } from '../types/hero';
import { StatusConfirmDialog } from './StatusConfirmDialog';

interface HeroStatusToggleProps {
  hero: Hero;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function HeroStatusToggle({ hero, onSuccess, onError }: HeroStatusToggleProps) {
  const [pendingTarget, setPendingTarget] = useState<boolean | null>(null);
  const mutation = useUpdateHeroStatusMutation();

  function requestChange(): void {
    setPendingTarget(!hero.is_active);
  }

  function cancel(): void {
    if (mutation.isPending) {
      return;
    }
    setPendingTarget(null);
  }

  function confirm(): void {
    if (pendingTarget === null) {
      return;
    }
    mutation.mutate(
      { id: hero.id, isActive: pendingTarget },
      {
        onSuccess: () => {
          onSuccess(pendingTarget ? 'Hero reactivated.' : 'Hero deactivated.');
          setPendingTarget(null);
        },
        onError: (error: unknown) => {
          const message = error instanceof ApiError ? error.message : 'Something went wrong.';
          onError(message);
          setPendingTarget(null);
        },
      },
    );
  }

  return (
    <>
      <Switch
        checked={hero.is_active}
        onChange={requestChange}
        disabled={mutation.isPending}
        inputProps={{ 'aria-label': `Toggle active state for ${hero.name}` }}
      />
      <StatusConfirmDialog
        open={pendingTarget !== null}
        heroName={hero.name}
        targetActive={pendingTarget ?? false}
        isPending={mutation.isPending}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </>
  );
}
