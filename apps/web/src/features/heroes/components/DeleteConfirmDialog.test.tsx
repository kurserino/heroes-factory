import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '../types/hero';
import { HeroActions } from './HeroActions';

// DeleteConfirmDialog itself is presentational; the confirm-before-mutation
// behavior lives one level up in HeroActions (which owns the delete
// mutation), so that is what this test exercises.
vi.mock('../api/heroesApi', () => ({
  deleteHero: vi.fn(),
  updateHeroStatus: vi.fn(),
}));

import { deleteHero } from '../api/heroesApi';

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

describe('DeleteConfirmDialog (via HeroActions)', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('requires confirmation before the delete mutation fires', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteHero).mockResolvedValue(undefined);

    renderWithClient(
      <HeroActions hero={makeHero()} onEdit={vi.fn()} onSuccess={vi.fn()} onError={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete Peter Parker' }));

    expect(deleteHero).not.toHaveBeenCalled();
    expect(screen.getByText('Permanently delete hero?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteHero).toHaveBeenCalledWith('1'));
  });

  it('does not call the mutation when the confirmation is canceled', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteHero).mockResolvedValue(undefined);

    renderWithClient(
      <HeroActions hero={makeHero()} onEdit={vi.fn()} onSuccess={vi.fn()} onError={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete Peter Parker' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(deleteHero).not.toHaveBeenCalled();
  });
});
