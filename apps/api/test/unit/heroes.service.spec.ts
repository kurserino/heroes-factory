import { ConflictException } from '@nestjs/common';
import { AvatarUrlValidator } from '../../src/heroes/avatar-url-validator';
import { CreateHeroDto } from '../../src/heroes/dto/create-hero.dto';
import { Hero } from '../../src/heroes/entities/hero.entity';
import {
  CreatableHeroFields,
  EditableHeroFields,
  HeroesRepository,
} from '../../src/heroes/heroes.repository';
import { HeroesService } from '../../src/heroes/heroes.service';

function makeHero(overrides: Partial<Hero> = {}): Hero {
  return {
    id: 'hero-1',
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

class FakeHeroesRepository implements HeroesRepository {
  public heroes = new Map<string, Hero>();
  public updateStatusCalls: Array<{ id: string; isActive: boolean }> = [];
  public updateCalls: Array<{ id: string; data: EditableHeroFields }> = [];

  async create(data: CreatableHeroFields): Promise<Hero> {
    const hero = makeHero({ ...data, id: 'new-hero', is_active: true });
    this.heroes.set(hero.id, hero);
    return hero;
  }

  async findMany() {
    return { data: [...this.heroes.values()], total: this.heroes.size };
  }

  async findById(id: string): Promise<Hero | null> {
    return this.heroes.get(id) ?? null;
  }

  async update(id: string, data: EditableHeroFields): Promise<Hero> {
    this.updateCalls.push({ id, data });
    const existing = this.heroes.get(id);
    if (!existing) throw new Error('not found');
    const updated = { ...existing, ...data };
    this.heroes.set(id, updated);
    return updated;
  }

  async updateStatus(id: string, isActive: boolean): Promise<Hero> {
    this.updateStatusCalls.push({ id, isActive });
    const existing = this.heroes.get(id);
    if (!existing) throw new Error('not found');
    const updated = { ...existing, is_active: isActive };
    this.heroes.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.heroes.delete(id);
  }
}

class FakeAvatarUrlValidator extends AvatarUrlValidator {
  async assertLoadableImage(): Promise<void> {
    return undefined;
  }
}

function makeService(repository: FakeHeroesRepository) {
  return new HeroesService(repository, new FakeAvatarUrlValidator());
}

describe('HeroesService', () => {
  it('create() always sets is_active to true regardless of input', async () => {
    const repository = new FakeHeroesRepository();
    const service = makeService(repository);

    const dto: CreateHeroDto = {
      name: 'Bruce Wayne',
      nickname: 'Batman',
      date_of_birth: '1970-01-01',
      universe: 'DC',
      main_power: 'Genius detective',
      avatar_url: 'https://example.com/batman.png',
    } as CreateHeroDto;

    const hero = await service.create(dto);

    expect(hero.is_active).toBe(true);
  });

  it('update() rejects when the target hero is inactive', async () => {
    const repository = new FakeHeroesRepository();
    const inactiveHero = makeHero({ id: 'hero-inactive', is_active: false });
    repository.heroes.set(inactiveHero.id, inactiveHero);
    const service = makeService(repository);

    await expect(
      service.update(inactiveHero.id, { name: 'New Name' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('remove() rejects when the target hero is inactive', async () => {
    const repository = new FakeHeroesRepository();
    const inactiveHero = makeHero({ id: 'hero-inactive', is_active: false });
    repository.heroes.set(inactiveHero.id, inactiveHero);
    const service = makeService(repository);

    await expect(service.remove(inactiveHero.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('updateStatus() activates an inactive hero', async () => {
    const repository = new FakeHeroesRepository();
    const inactiveHero = makeHero({ id: 'hero-inactive', is_active: false });
    repository.heroes.set(inactiveHero.id, inactiveHero);
    const service = makeService(repository);

    const hero = await service.updateStatus(inactiveHero.id, true);

    expect(hero.is_active).toBe(true);
  });

  it('updateStatus() deactivates an active hero and changes only is_active', async () => {
    const repository = new FakeHeroesRepository();
    const activeHero = makeHero({ id: 'hero-active', is_active: true });
    repository.heroes.set(activeHero.id, activeHero);
    const service = makeService(repository);

    const hero = await service.updateStatus(activeHero.id, false);

    expect(hero.is_active).toBe(false);
    expect(hero.name).toBe(activeHero.name);
    expect(hero.nickname).toBe(activeHero.nickname);
    expect(hero.avatar_url).toBe(activeHero.avatar_url);
    expect(repository.updateCalls).toHaveLength(0);
    expect(repository.updateStatusCalls).toEqual([
      { id: activeHero.id, isActive: false },
    ]);
  });
});
