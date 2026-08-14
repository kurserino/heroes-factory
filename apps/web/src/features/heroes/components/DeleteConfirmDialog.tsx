import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Hero } from '../types/hero';

interface DeleteConfirmDialogProps {
  hero: Hero | null;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ hero, isPending, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={hero !== null} onClose={isPending ? undefined : onCancel}>
      <DialogTitle>Permanently delete hero?</DialogTitle>
      <DialogContent>
        {hero && (
          <>
            This will permanently delete {hero.name}. This action cannot be undone.
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={isPending} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
