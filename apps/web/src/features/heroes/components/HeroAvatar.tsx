import { Avatar, Box, Skeleton } from '@mui/material';
import { useState } from 'react';

interface HeroAvatarProps {
  src: string;
  alt: string;
  size: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// Shows a skeleton in place of the avatar until the image has actually
// loaded (or failed), instead of a blank/white circle for however long the
// image takes to arrive.
export function HeroAvatar({ src, alt, size }: HeroAvatarProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Box position="relative" width={size} height={size}>
      {!loaded && (
        <Skeleton
          variant="circular"
          animation="wave"
          width={size}
          height={size}
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      <Avatar
        src={src}
        alt={alt}
        sx={{ width: size, height: size, visibility: loaded ? 'visible' : 'hidden' }}
        slotProps={{
          img: {
            onLoad: () => setLoaded(true),
            onError: () => setLoaded(true),
          },
        }}
      >
        {getInitials(alt)}
      </Avatar>
    </Box>
  );
}
