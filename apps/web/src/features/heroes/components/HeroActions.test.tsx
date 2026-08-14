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

    await user.click(screen.getByRole('button', { name: 'Mais ações de Peter Parker' }));

    expect(screen.getByRole('menuitem', { name: 'Editar Peter Parker' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Excluir Peter Parker' })).toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Alternar status ativo de Peter Parker' });
    expect(toggle).toBeChecked();

    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByText('Excluir')).not.toBeInTheDocument();
    expect(screen.queryByText('Desativar')).not.toBeInTheDocument();
    expect(screen.queryByText('Reativar')).not.toBeInTheDocument();
  });

  it('shows only an unchecked switch for an inactive hero', async () => {
    const user = userEvent.setup();
    renderWithClient(<HeroActions {...baseProps(makeHero({ is_active: false }))} />);

    await user.click(screen.getByRole('button', { name: 'Mais ações de Peter Parker' }));

    expect(screen.queryByRole('menuitem', { name: 'Editar Peter Parker' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Excluir Peter Parker' }),
    ).not.toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Alternar status ativo de Peter Parker' });
    expect(toggle).not.toBeChecked();
  });

  it('closes the menu after selecting Edit', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const hero = makeHero({ is_active: true });
    renderWithClient(<HeroActions {...baseProps(hero)} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Mais ações de Peter Parker' }));
    await user.click(screen.getByRole('menuitem', { name: 'Editar Peter Parker' }));

    expect(onEdit).toHaveBeenCalledWith(hero);
    await waitFor(() =>
      expect(
        screen.queryByRole('menuitem', { name: 'Editar Peter Parker' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('closes the menu immediately after selecting Delete, before the confirmation completes', async () => {
    const user = userEvent.setup();
    vi.mocked(deleteHero).mockResolvedValue(undefined);
    renderWithClient(<HeroActions {...baseProps(makeHero({ is_active: true }))} />);

    await user.click(screen.getByRole('button', { name: 'Mais ações de Peter Parker' }));
    await user.click(screen.getByRole('menuitem', { name: 'Excluir Peter Parker' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('menuitem', { name: 'Excluir Peter Parker' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Excluir herói permanentemente?')).toBeInTheDocument();
    expect(deleteHero).not.toHaveBeenCalled();
  });

  it('closes the menu immediately after toggling the switch, before the confirmation completes', async () => {
    const user = userEvent.setup();
    vi.mocked(updateHeroStatus).mockResolvedValue(makeHero({ is_active: false }));
    renderWithClient(<HeroActions {...baseProps(makeHero({ is_active: true }))} />);

    await user.click(screen.getByRole('button', { name: 'Mais ações de Peter Parker' }));
    await user.click(screen.getByRole('switch', { name: 'Alternar status ativo de Peter Parker' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('switch', { name: 'Alternar status ativo de Peter Parker' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Desativar herói?')).toBeInTheDocument();
    expect(updateHeroStatus).not.toHaveBeenCalled();
  });
});
