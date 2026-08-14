import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '../types/hero';
import { HeroStatusToggle } from './HeroStatusToggle';

vi.mock('../api/heroesApi', () => ({
  updateHeroStatus: vi.fn(),
}));

import { updateHeroStatus } from '../api/heroesApi';

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

describe('HeroStatusToggle', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('requires confirmation before the status mutation fires', async () => {
    const user = userEvent.setup();
    vi.mocked(updateHeroStatus).mockResolvedValue(makeHero({ is_active: false }));

    renderWithClient(
      <HeroStatusToggle hero={makeHero({ is_active: true })} onSuccess={vi.fn()} onError={vi.fn()} />,
    );

    await user.click(screen.getByRole('switch', { name: 'Toggle active state for Peter Parker' }));

    // Mutation must not fire just from selecting the menu item.
    expect(updateHeroStatus).not.toHaveBeenCalled();
    expect(screen.getByText('Deactivate hero?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => expect(updateHeroStatus).toHaveBeenCalledWith('1', false));
  });

  it('does not call the mutation when the confirmation is canceled', async () => {
    const user = userEvent.setup();
    vi.mocked(updateHeroStatus).mockResolvedValue(makeHero());

    renderWithClient(
      <HeroStatusToggle hero={makeHero({ is_active: true })} onSuccess={vi.fn()} onError={vi.fn()} />,
    );

    await user.click(screen.getByRole('switch', { name: 'Toggle active state for Peter Parker' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(updateHeroStatus).not.toHaveBeenCalled();
  });
});
