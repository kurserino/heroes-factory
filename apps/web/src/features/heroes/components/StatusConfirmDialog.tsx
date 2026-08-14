import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from '@mui/material';

interface StatusConfirmDialogProps {
  open: boolean;
  heroName: string;
  targetActive: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function StatusConfirmDialog({
  open,
  heroName,
  targetActive,
  isPending,
  onConfirm,
  onCancel,
}: StatusConfirmDialogProps) {
  const action = targetActive ? 'reativar' : 'desativar';

  return (
    <Dialog open={open} onClose={isPending ? undefined : onCancel}>
      <DialogTitle>{targetActive ? 'Reativar herói?' : 'Desativar herói?'}</DialogTitle>
      <DialogContent>
        Tem certeza que deseja {action} {heroName}?
      </DialogContent>
      <Divider />
      <DialogActions sx={{ justifyContent: 'center', px: 4, py: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={isPending} variant="contained">
          {targetActive ? 'Reativar' : 'Desativar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
