import { describe, expect, it } from 'vitest';
import { heroFormSchema } from './heroFormSchema';

function validValues() {
  return {
    name: 'Peter Parker',
    nickname: 'Spider-Man',
    date_of_birth: '1995-08-10',
    universe: 'Marvel',
    main_power: 'Wall-crawling',
    avatar_url: 'https://example.com/avatar.png',
  };
}

describe('heroFormSchema', () => {
  it('accepts a fully valid set of values', () => {
    const result = heroFormSchema.safeParse(validValues());
    expect(result.success).toBe(true);
  });

  it('rejects a date of birth in the future', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const result = heroFormSchema.safeParse({
      ...validValues(),
      date_of_birth: futureDate.toISOString().slice(0, 10),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data de nascimento não pode ser no futuro');
    }
  });

  it('rejects an empty required field', () => {
    const result = heroFormSchema.safeParse({ ...validValues(), nickname: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome de guerra é obrigatório');
    }
  });

  it('rejects a malformed avatar URL', () => {
    const result = heroFormSchema.safeParse({ ...validValues(), avatar_url: 'not-a-url' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Deve ser uma URL válida');
    }
  });

  it('trims whitespace from text fields', () => {
    const result = heroFormSchema.safeParse({ ...validValues(), name: '  Peter Parker  ' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Peter Parker');
    }
  });
});
