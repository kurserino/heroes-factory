import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Hero } from '../types/hero';
import { HeroCard } from './HeroCard';

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

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

function baseProps() {
  return {
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onActionSuccess: vi.fn(),
    onActionError: vi.fn(),
  };
}

describe('HeroCard', () => {
  it('renders an active hero with Edit and Delete actions available', () => {
    renderWithClient(<HeroCard hero={makeHero({ is_active: true })} {...baseProps()} />);

    expect(screen.getByText('Peter Parker')).toBeInTheDocument();
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero-card')).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('button', { name: 'Edit Peter Parker' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Peter Parker' })).toBeInTheDocument();
  });

  it('renders an inactive hero with gray presentation and no Edit/Delete actions', () => {
    renderWithClient(<HeroCard hero={makeHero({ is_active: false })} {...baseProps()} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByTestId('hero-card')).toHaveAttribute('data-active', 'false');
    expect(screen.queryByRole('button', { name: 'Edit Peter Parker' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete Peter Parker' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Toggle active state for Peter Parker')).toBeInTheDocument();
  });
});
