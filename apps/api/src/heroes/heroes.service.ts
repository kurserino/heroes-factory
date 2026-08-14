import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AvatarUrlValidator } from './avatar-url-validator';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { Hero } from './entities/hero.entity';
import { HEROES_PAGE_SIZE } from './heroes.constants';
import { HEROES_REPOSITORY, HeroesRepository } from './heroes.repository';

export interface PaginatedHeroes {
  data: Hero[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class HeroesService {
  constructor(
    @Inject(HEROES_REPOSITORY)
    private readonly heroesRepository: HeroesRepository,
    private readonly avatarUrlValidator: AvatarUrlValidator,
  ) {}

  async list(page: number, search?: string): Promise<PaginatedHeroes> {
    const { data, total } = await this.heroesRepository.findMany({
      page,
      search,
    });

    return {
      data,
      pagination: {
        page,
        limit: HEROES_PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / HEROES_PAGE_SIZE),
      },
    };
  }

  async findOne(id: string): Promise<Hero> {
    const hero = await this.heroesRepository.findById(id);
    if (!hero) {
      throw new NotFoundException(`Hero ${id} not found`);
    }
    return hero;
  }

  async create(dto: CreateHeroDto): Promise<Hero> {
    await this.avatarUrlValidator.assertLoadableImage(dto.avatar_url);
    return this.heroesRepository.create(dto);
  }

  async update(id: string, dto: UpdateHeroDto): Promise<Hero> {
    const existing = await this.findOne(id);
    if (!existing.is_active) {
      throw new ConflictException('Cannot edit an inactive hero');
    }
    if (dto.avatar_url) {
      await this.avatarUrlValidator.assertLoadableImage(dto.avatar_url);
    }
    return this.heroesRepository.update(id, dto);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Hero> {
    await this.findOne(id);
    return this.heroesRepository.updateStatus(id, isActive);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing.is_active) {
      throw new ConflictException('Cannot delete an inactive hero');
    }
    await this.heroesRepository.delete(id);
  }
}
