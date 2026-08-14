import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Hero } from '../types/hero';

interface HeroDetailsDialogProps {
  hero: Hero | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box flex={1}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

export function HeroDetailsDialog({ hero, onClose }: HeroDetailsDialogProps) {
  const open = hero !== null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {hero && (
        <>
          <DialogTitle
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            {hero.nickname}
            <IconButton aria-label="Close" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2} py={1}>
              <Box display="flex" justifyContent="center">
                <Avatar src={hero.avatar_url} alt={hero.name} sx={{ width: 96, height: 96 }} />
              </Box>
              <Stack direction="row" spacing={2}>
                <Field label="Full name" value={hero.name} />
                <Field label="Date of birth" value={hero.date_of_birth} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Field label="Universe" value={hero.universe} />
                <Field label="Main power" value={hero.main_power} />
              </Stack>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ justifyContent: 'center', px: 4, py: 3 }}>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
