import { z } from 'zod';

// Mirrors the backend's DTO validation rules (data-model.md) for fast
// client-side feedback. The backend remains the source of truth — this
// never replaces server-side enforcement (Constitution Principle V), and in
// particular cannot replicate the avatar-URL "resolves to a loadable image"
// check, which only the server verifies.
export const heroFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  nickname: z.string().trim().min(1, 'Nickname is required').max(120),
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Invalid date')
    .refine(
      (value) => new Date(value).getTime() <= Date.now(),
      'Date of birth cannot be in the future',
    ),
  universe: z.string().trim().min(1, 'Universe is required').max(120),
  main_power: z.string().trim().min(1, 'Main power is required').max(200),
  avatar_url: z.string().trim().min(1, 'Avatar URL is required').url('Must be a valid URL'),
});

export type HeroFormValues = z.infer<typeof heroFormSchema>;
