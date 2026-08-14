import {
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
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
    <Stack>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
}

export function HeroDetailsDialog({ hero, onClose }: HeroDetailsDialogProps) {
  const open = hero !== null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {hero && (
        <>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Hero Details
            <IconButton aria-label="Close" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} py={1}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={hero.avatar_url} alt={hero.name} sx={{ width: 72, height: 72 }} />
                <Stack>
                  <Typography variant="h6">{hero.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hero.nickname}
                  </Typography>
                </Stack>
              </Stack>
              <Field label="Date of birth" value={hero.date_of_birth} />
              <Field label="Universe" value={hero.universe} />
              <Field label="Main power" value={hero.main_power} />
              <Field label="Status" value={hero.is_active ? 'Active' : 'Inactive'} />
              <Field label="Created" value={hero.created_at} />
              <Field label="Last updated" value={hero.updated_at} />
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
