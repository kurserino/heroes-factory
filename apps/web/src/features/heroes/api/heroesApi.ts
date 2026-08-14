import { apiClient } from '../../../lib/apiClient';
import { Hero, HeroListResponse } from '../types/hero';

// Only read operations are implemented in this phase; create/edit/status/
// delete mutation functions are added when those flows are built.
export function listHeroes(page: number, search?: string): Promise<HeroListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (search) {
    params.set('search', search);
  }
  return apiClient.get<HeroListResponse>(`/heroes?${params.toString()}`);
}

export function getHero(id: string): Promise<Hero> {
  return apiClient.get<Hero>(`/heroes/${id}`);
}
