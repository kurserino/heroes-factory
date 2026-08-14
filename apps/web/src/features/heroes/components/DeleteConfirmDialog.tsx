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
      <DialogTitle>Excluir herói permanentemente?</DialogTitle>
      <DialogContent>
        {displayHero && (
          <>Isso vai excluir permanentemente {displayHero.name}. Essa ação não pode ser desfeita.</>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ justifyContent: 'center', px: 4, py: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={isPending} color="error" variant="contained">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
