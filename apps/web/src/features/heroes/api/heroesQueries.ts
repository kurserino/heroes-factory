import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HeroFormValues } from '../schemas/heroFormSchema';
import {
  createHero,
  deleteHero,
  getHero,
  listHeroes,
  updateHero,
  updateHeroStatus,
} from './heroesApi';

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

export function useCreateHeroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HeroFormValues) => createHero(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['heroes', 'list'] });
    },
  });
}

export function useUpdateHeroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HeroFormValues }) => updateHero(id, data),
    onSuccess: (hero) => {
      void queryClient.invalidateQueries({ queryKey: ['heroes', 'list'] });
      void queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', hero.id] });
    },
  });
}

export function useUpdateHeroStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateHeroStatus(id, isActive),
    onSuccess: (hero) => {
      void queryClient.invalidateQueries({ queryKey: ['heroes', 'list'] });
      void queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', hero.id] });
    },
  });
}

export function useDeleteHeroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHero(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['heroes', 'list'] });
    },
  });
}
