import { Alert, Snackbar } from '@mui/material';

export interface FeedbackMessage {
  severity: 'success' | 'error';
  text: string;
}

interface FeedbackSnackbarProps {
  message: FeedbackMessage | null;
  onClose: () => void;
}

export function FeedbackSnackbar({ message, onClose }: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={message !== null}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {message ? (
        <Alert severity={message.severity} onClose={onClose} variant="filled">
          {message.text}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
