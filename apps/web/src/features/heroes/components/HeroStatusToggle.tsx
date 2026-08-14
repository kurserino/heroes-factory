import { MenuItem, Switch } from '@mui/material';
import { forwardRef, useState } from 'react';
import { useUpdateHeroStatusMutation } from '../api/heroesQueries';
import { ApiError } from '../../../lib/apiClient';
import { Hero } from '../types/hero';
import { StatusConfirmDialog } from './StatusConfirmDialog';

interface HeroStatusToggleProps {
  hero: Hero;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  // Called the moment the user selects this item, before the confirmation
  // dialog opens — lets the parent "More actions" menu close immediately.
  onSelect?: () => void;
}

// Renders as a MenuItem containing an MUI Switch (FR-014/FR-014a: grouped
// inside the "More actions" overflow menu; FR-014b: icon/control-only, no
// visible "Deactivate"/"Reactivate" text). The Switch's checked state always
// reflects the currently-persisted hero.is_active (checked = active), never
// an optimistic value — it only flips once the mutation actually succeeds.
// Confirmation-dialog and mutation logic is unchanged from before FR-014b.
export const HeroStatusToggle = forwardRef<HTMLLIElement, HeroStatusToggleProps>(
  function HeroStatusToggle({ hero, onSuccess, onError, onSelect }, ref) {
    const [pendingTarget, setPendingTarget] = useState<boolean | null>(null);
    const mutation = useUpdateHeroStatusMutation();

    function requestChange(): void {
      onSelect?.();
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
        <MenuItem ref={ref} disabled={mutation.isPending}>
          <Switch
            checked={hero.is_active}
            onChange={requestChange}
            disabled={mutation.isPending}
            inputProps={{
              role: 'switch',
              'aria-label': `Toggle active state for ${hero.name}`,
            }}
          />
        </MenuItem>
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
  },
);
