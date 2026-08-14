import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '../types/hero';
import { HeroActions } from './HeroActions';

vi.mock('../api/heroesApi', () => ({
  deleteHero: vi.fn(),
  updateHeroStatus: vi.fn(),
}));

import { deleteHero, updateHeroStatus } from '../api/heroesApi';

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

function baseProps(hero: Hero) {
  return { hero, onEdit: vi.fn(), onSuccess: vi.fn(), onError: vi.fn() };
}

describe('HeroActions "More actions" menu', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows icon-only Edit/Delete and a checked switch for an active hero, with no visible text labels', async () => {
    const user = userEvent.setup();
    renderWithClient(<HeroActions {...baseProps(makeHero({ is_active: true }))} />);

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));

    expect(screen.getByRole('menuitem', { name: 'Edit Peter Parker' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete Peter Parker' })).toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Toggle active state for Peter Parker' });
    expect(toggle).toBeChecked();

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByText('Deactivate')).not.toBeInTheDocument();
    expect(screen.queryByText('Reactivate')).not.toBeInTheDocument();
  });

  it('shows only an unchecked switch for an inactive hero', async () => {
    const user = userEvent.setup();
    renderWithClient(<HeroActions {...baseProps(makeHero({ is_active: false }))} />);

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));

    expect(screen.queryByRole('menuitem', { name: 'Edit Peter Parker' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete Peter Parker' })).not.toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Toggle active state for Peter Parker' });
    expect(toggle).not.toBeChecked();
  });

  it('closes the menu after selecting Edit', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const hero = makeHero({ is_active: true });
    renderWithClient(<HeroActions {...baseProps(hero)} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit Peter Parker' }));

    expect(onEdit).toHaveBeenCalledWith(hero);
    await waitFor(() =>
      expect(screen.queryByRole('menuitem', { name: 'Edit Peter Parker' })).not.toBeInTheDocument(),
    );
  });

  it('closes the menu immediately after selecting Delete, before the confirmation completes', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteHero).mockResolvedValue(undefined);
    renderWithClient(<HeroActions {...baseProps(makeHero({ is_active: true }))} />);

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete Peter Parker' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('menuitem', { name: 'Delete Peter Parker' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Permanently delete hero?')).toBeInTheDocument();
    expect(deleteHero).not.toHaveBeenCalled();
  });

  it('closes the menu immediately after toggling the switch, before the confirmation completes', async () => {
    const user = userEvent.setup();
    vi.mocked(updateHeroStatus).mockResolvedValue(makeHero({ is_active: false }));
    renderWithClient(<HeroActions {...baseProps(makeHero({ is_active: true }))} />);

    await user.click(screen.getByRole('button', { name: 'More actions for Peter Parker' }));
    await user.click(screen.getByRole('switch', { name: 'Toggle active state for Peter Parker' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('switch', { name: 'Toggle active state for Peter Parker' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Deactivate hero?')).toBeInTheDocument();
    expect(updateHeroStatus).not.toHaveBeenCalled();
  });
});
