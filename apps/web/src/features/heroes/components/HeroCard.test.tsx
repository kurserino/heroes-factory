import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('renders an active hero whose "More actions" menu offers Edit and Delete', async () => {
    const user = userEvent.setup();
    renderWithClient(<HeroCard hero={makeHero({ is_active: true })} {...baseProps()} />);

    expect(screen.getByText('Peter Parker')).toBeInTheDocument();
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero-card')).toHaveAttribute('data-active', 'true');

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));

    expect(screen.getByRole('menuitem', { name: 'Edit Peter Parker' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete Peter Parker' })).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Toggle active state for Peter Parker' }),
    ).toBeChecked();
  });

  it('renders an inactive hero with gray presentation and no Edit/Delete in its menu', async () => {
    const user = userEvent.setup();
    renderWithClient(<HeroCard hero={makeHero({ is_active: false })} {...baseProps()} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByTestId('hero-card')).toHaveAttribute('data-active', 'false');

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));

    expect(screen.queryByRole('menuitem', { name: 'Edit Peter Parker' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete Peter Parker' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Toggle active state for Peter Parker' }),
    ).not.toBeChecked();
  });
});
