import { z } from 'zod';

// Mirrors the backend's DTO validation rules (data-model.md) for fast
// client-side feedback. The backend remains the source of truth — this
// never replaces server-side enforcement (Constitution Principle V), and in
// particular cannot replicate the avatar-URL "resolves to a loadable image"
// check, which only the server verifies.
export const heroFormSchema = z.object({
  name: z.string().trim().min(1, 'Nome completo é obrigatório').max(120),
  nickname: z.string().trim().min(1, 'Nome de guerra é obrigatório').max(120),
  date_of_birth: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Data inválida')
    .refine(
      (value) => new Date(value).getTime() <= Date.now(),
      'Data de nascimento não pode ser no futuro',
    ),
  universe: z.string().trim().min(1, 'Universo é obrigatório').max(120),
  main_power: z.string().trim().min(1, 'Habilidade é obrigatória').max(200),
  avatar_url: z.string().trim().min(1, 'Avatar é obrigatório').url('Deve ser uma URL válida'),
});

export type HeroFormValues = z.infer<typeof heroFormSchema>;
