import { Avatar, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { Hero } from '../types/hero';
import { HeroActions } from './HeroActions';

interface HeroCardProps {
  hero: Hero;
  onSelect: (hero: Hero) => void;
  onEdit: (hero: Hero) => void;
  onActionSuccess: (message: string) => void;
  onActionError: (message: string) => void;
}

export function HeroCard({ hero, onSelect, onEdit, onActionSuccess, onActionError }: HeroCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        opacity: hero.is_active ? 1 : 0.6,
        filter: hero.is_active ? 'none' : 'grayscale(1)',
        bgcolor: hero.is_active ? 'background.paper' : 'action.disabledBackground',
      }}
      data-testid="hero-card"
      data-active={hero.is_active}
    >
      <CardActionArea onClick={() => onSelect(hero)} aria-label={`View details for ${hero.name}`}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Avatar src={hero.avatar_url} alt={hero.name} sx={{ width: 64, height: 64 }} />
          <Typography variant="subtitle1" component="h3">
            {hero.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hero.nickname}
          </Typography>
          {!hero.is_active && (
            <Typography variant="caption" color="text.disabled">
              Inactive
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      <HeroActions hero={hero} onEdit={onEdit} onSuccess={onActionSuccess} onError={onActionError} />
    </Card>
  );
}
