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
  const action = targetActive ? 'reactivate' : 'deactivate';

  return (
    <Dialog open={open} onClose={isPending ? undefined : onCancel}>
      <DialogTitle>{targetActive ? 'Reactivate hero?' : 'Deactivate hero?'}</DialogTitle>
      <DialogContent>
        Are you sure you want to {action} {heroName}?
      </DialogContent>
      <Divider />
      <DialogActions sx={{ justifyContent: 'center', px: 4, py: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={isPending} variant="contained">
          {targetActive ? 'Reactivate' : 'Deactivate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
