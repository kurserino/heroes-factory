import {
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
import { HeroAvatar } from './HeroAvatar';

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

function formatDateOfBirth(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) {
    return iso;
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
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
            <IconButton aria-label="Fechar" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2} py={1}>
              <Box display="flex" justifyContent="center">
                <HeroAvatar src={hero.avatar_url} alt={hero.name} size={96} />
              </Box>
              <Stack direction="row" spacing={2}>
                <Field label="Nome completo:" value={hero.name} />
                <Field label="Data de nascimento" value={formatDateOfBirth(hero.date_of_birth)} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Field label="Universo" value={hero.universe} />
                <Field label="Habilidade" value={hero.main_power} />
              </Stack>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ justifyContent: 'center', px: 4, py: 3 }}>
            <Button variant="outlined" onClick={onClose}>
              Fechar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
