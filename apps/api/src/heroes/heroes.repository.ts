import { Hero } from './entities/hero.entity';

export const HEROES_REPOSITORY = Symbol('HEROES_REPOSITORY');

export interface CreatableHeroFields {
  name: string;
  nickname: string;
  date_of_birth: string;
  universe: string;
  main_power: string;
  avatar_url: string;
}

export type EditableHeroFields = Partial<CreatableHeroFields>;

export interface ListHeroesParams {
  page: number;
  search?: string;
}

export interface ListHeroesResult {
  data: Hero[];
  total: number;
}

export interface HeroesRepository {
  create(data: CreatableHeroFields): Promise<Hero>;
  findMany(params: ListHeroesParams): Promise<ListHeroesResult>;
  findById(id: string): Promise<Hero | null>;
  update(id: string, data: EditableHeroFields): Promise<Hero>;
  updateStatus(id: string, isActive: boolean): Promise<Hero>;
  delete(id: string): Promise<void>;
}
