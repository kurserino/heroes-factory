import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../lib/apiClient';
import { Hero } from '../types/hero';
import { HeroFormDialog, HeroFormMode } from './HeroFormDialog';

vi.mock('../api/heroesApi', () => ({
  createHero: vi.fn(),
  updateHero: vi.fn(),
}));

import { createHero, updateHero } from '../api/heroesApi';

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

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Bruce Wayne');
  await user.type(screen.getByLabelText('Nickname'), 'Batman');
  await user.type(screen.getByLabelText('Date of birth'), '1970-01-01');
  await user.type(screen.getByLabelText('Universe'), 'DC');
  await user.type(screen.getByLabelText('Main power'), 'Genius detective');
  await user.type(screen.getByLabelText('Avatar URL'), 'https://example.com/batman.png');
}

describe('HeroFormDialog', () => {
  it('shows validation errors and preserves entered values on invalid submission', async () => {
    const user = userEvent.setup();
    const state: HeroFormMode = { type: 'create' };

    renderWithClient(
      <HeroFormDialog state={state} onClose={vi.fn()} onSuccess={vi.fn()} onError={vi.fn()} />,
    );

    await user.type(screen.getByLabelText('Name'), 'Bruce Wayne');
    // Leave other required fields empty and submit.
    await user.click(screen.getByRole('button', { name: 'Create hero' }));

    expect(await screen.findByText('Nickname is required')).toBeInTheDocument();
    expect(createHero).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Name')).toHaveValue('Bruce Wayne');
  });

  it('shows success feedback and closes the dialog on a successful create submission', async () => {
    const user = userEvent.setup();
    vi.mocked(createHero).mockResolvedValue(makeHero());
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    renderWithClient(
      <HeroFormDialog
        state={{ type: 'create' }}
        onClose={onClose}
        onSuccess={onSuccess}
        onError={vi.fn()}
      />,
    );

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Create hero' }));

    await waitFor(() => expect(createHero).toHaveBeenCalled());
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('Hero created.'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error feedback and keeps entered values when a create submission fails', async () => {
    const user = userEvent.setup();
    vi.mocked(createHero).mockRejectedValue(
      new ApiError(400, 'Bad Request', 'avatar_url must resolve to a loadable image'),
    );
    const onError = vi.fn();
    const onClose = vi.fn();

    renderWithClient(
      <HeroFormDialog
        state={{ type: 'create' }}
        onClose={onClose}
        onSuccess={vi.fn()}
        onError={onError}
      />,
    );

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Create hero' }));

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith('avatar_url must resolve to a loadable image'),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Name')).toHaveValue('Bruce Wayne');
    expect(screen.getByLabelText('Avatar URL')).toHaveValue('https://example.com/batman.png');
  });

  it('shows error feedback and keeps entered values when an edit submission fails', async () => {
    const user = userEvent.setup();
    const hero = makeHero();
    vi.mocked(updateHero).mockRejectedValue(new ApiError(409, 'Conflict', 'Cannot edit an inactive hero'));
    const onError = vi.fn();
    const onClose = vi.fn();

    renderWithClient(
      <HeroFormDialog
        state={{ type: 'edit', hero }}
        onClose={onClose}
        onSuccess={vi.fn()}
        onError={onError}
      />,
    );

    const mainPowerField = await screen.findByLabelText('Main power');
    expect(mainPowerField).toHaveValue(hero.main_power);

    await user.clear(mainPowerField);
    await user.type(mainPowerField, 'Updated power');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Cannot edit an inactive hero'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Main power')).toHaveValue('Updated power');
  });
});
