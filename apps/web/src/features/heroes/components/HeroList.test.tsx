import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroListResponse } from '../types/hero';
import { HeroList } from './HeroList';

vi.mock('../api/heroesApi', () => ({
  listHeroes: vi.fn(),
  getHero: vi.fn(),
}));

import { listHeroes } from '../api/heroesApi';

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function emptyResponse(): HeroListResponse {
  return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
}

describe('HeroList', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows a loading state, then renders the fetched list', async () => {
    vi.mocked(listHeroes).mockResolvedValue({
      data: [
        {
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
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderWithClient(<HeroList />);

    expect(screen.getByTestId('hero-list-loading')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Spider-Man')).toBeInTheDocument());
    expect(screen.queryByTestId('hero-list-loading')).not.toBeInTheDocument();
  });

  it('shows the empty-list state when zero heroes are returned', async () => {
    vi.mocked(listHeroes).mockResolvedValue(emptyResponse());

    renderWithClient(<HeroList />);

    await waitFor(() => expect(screen.getByTestId('hero-list-empty')).toBeInTheDocument());
  });

  it('shows the API-error state when the list query fails', async () => {
    vi.mocked(listHeroes).mockRejectedValue(new Error('network error'));

    renderWithClient(<HeroList />);

    await waitFor(() => expect(screen.getByTestId('hero-list-error')).toBeInTheDocument());
  });

  it('submitting a search re-queries and shows the no-results state for a non-matching term', async () => {
    const user = userEvent.setup();
    vi.mocked(listHeroes).mockResolvedValueOnce(emptyResponse());
    vi.mocked(listHeroes).mockResolvedValueOnce(emptyResponse());

    renderWithClient(<HeroList />);
    await waitFor(() => expect(screen.getByTestId('hero-list-empty')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Buscar heróis'), 'batman');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(screen.getByTestId('hero-list-no-results')).toBeInTheDocument());
    expect(screen.getByText(/Nenhum herói encontrado/)).toHaveTextContent('batman');
    expect(listHeroes).toHaveBeenLastCalledWith(1, 'batman');
  });
});
