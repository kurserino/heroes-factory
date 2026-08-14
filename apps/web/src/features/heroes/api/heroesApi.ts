import { apiClient } from '../../../lib/apiClient';
import { HeroFormValues } from '../schemas/heroFormSchema';
import { Hero, HeroListResponse } from '../types/hero';

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

export function createHero(data: HeroFormValues): Promise<Hero> {
  return apiClient.post<Hero>('/heroes', data);
}

export function updateHero(id: string, data: HeroFormValues): Promise<Hero> {
  return apiClient.patch<Hero>(`/heroes/${id}`, data);
}

export function updateHeroStatus(id: string, isActive: boolean): Promise<Hero> {
  return apiClient.patch<Hero>(`/heroes/${id}/status`, { is_active: isActive });
}

export function deleteHero(id: string): Promise<void> {
  return apiClient.delete<void>(`/heroes/${id}`);
}
