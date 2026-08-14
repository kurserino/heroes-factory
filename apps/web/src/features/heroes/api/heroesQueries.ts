import { useQuery } from '@tanstack/react-query';
import { getHero, listHeroes } from './heroesApi';

export function useHeroListQuery(page: number, search?: string) {
  return useQuery({
    queryKey: ['heroes', 'list', { page, search }],
    queryFn: () => listHeroes(page, search),
  });
}

export function useHeroQuery(id: string | null) {
  return useQuery({
    queryKey: ['heroes', 'detail', id],
    queryFn: () => getHero(id as string),
    enabled: id !== null,
  });
}
