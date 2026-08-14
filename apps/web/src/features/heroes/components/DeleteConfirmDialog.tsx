import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from '@mui/material';
import { useRef } from 'react';
import { Hero } from '../types/hero';

interface DeleteConfirmDialogProps {
  hero: Hero | null;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  hero,
  isPending,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  // Keep showing the last hero while the dialog's closing transition plays,
  // instead of the content blanking out the instant the parent clears it.
  const lastHeroRef = useRef<Hero | null>(null);
  if (hero !== null) {
    lastHeroRef.current = hero;
  }
  const displayHero = hero ?? lastHeroRef.current;

  return (
    <Dialog open={hero !== null} onClose={isPending ? undefined : onCancel}>
      <DialogTitle>Permanently delete hero?</DialogTitle>
      <DialogContent>
        {displayHero && (
          <>This will permanently delete {displayHero.name}. This action cannot be undone.</>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ justifyContent: 'center', px: 4, py: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={isPending} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
