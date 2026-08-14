import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Hero } from '../types/hero';
import { HeroCard } from './HeroCard';

function makeHero(overrides: Partial<Hero> = {}): Hero {
  return {
    id: '1',
    name: 'Peter Parker',
    nickname: 'Spider-Man',
    date_of_birth: '1995-08-10',
    universe: 'Marvel',
    main_power: 'Wall-crawling',
    avatar_url: 'https://example.com/avatar.png',
    is_active: true,
    created_at: '2026-08-01T12:00:00.000Z',
    updated_at: '2026-08-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('HeroCard', () => {
  it('renders an active hero without the inactive marker', () => {
    render(<HeroCard hero={makeHero({ is_active: true })} onSelect={vi.fn()} />);

    expect(screen.getByText('Peter Parker')).toBeInTheDocument();
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero-card')).toHaveAttribute('data-active', 'true');
  });

  it('renders an inactive hero with gray/inactive presentation', () => {
    render(<HeroCard hero={makeHero({ is_active: false })} onSelect={vi.fn()} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByTestId('hero-card')).toHaveAttribute('data-active', 'false');
  });
});
