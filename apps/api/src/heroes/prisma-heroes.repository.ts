import { Injectable } from '@nestjs/common';
import { Hero as PrismaHero } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Hero } from './entities/hero.entity';
import {
  CreatableHeroFields,
  EditableHeroFields,
  HeroesRepository,
  ListHeroesParams,
  ListHeroesResult,
} from './heroes.repository';
import { HEROES_PAGE_SIZE } from './heroes.constants';

function toDate(value: string): Date {
  return new Date(value);
}

function toEntity(record: PrismaHero): Hero {
  return {
    id: record.id,
    name: record.name,
    nickname: record.nickname,
    date_of_birth: record.date_of_birth.toISOString().slice(0, 10),
    universe: record.universe,
    main_power: record.main_power,
    avatar_url: record.avatar_url,
    is_active: record.is_active,
    created_at: record.created_at.toISOString(),
    updated_at: record.updated_at.toISOString(),
  };
}

@Injectable()
export class PrismaHeroesRepository implements HeroesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatableHeroFields): Promise<Hero> {
    const record = await this.prisma.hero.create({
      data: {
        name: data.name,
        nickname: data.nickname,
        date_of_birth: toDate(data.date_of_birth),
        universe: data.universe,
        main_power: data.main_power,
        avatar_url: data.avatar_url,
      },
    });
    return toEntity(record);
  }

  async findMany({ page, search }: ListHeroesParams): Promise<ListHeroesResult> {
    const where = search
      ? {
          OR: [{ name: { contains: search } }, { nickname: { contains: search } }],
        }
      : {};

    const skip = (page - 1) * HEROES_PAGE_SIZE;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.hero.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        skip,
        take: HEROES_PAGE_SIZE,
      }),
      this.prisma.hero.count({ where }),
    ]);

    return { data: records.map(toEntity), total };
  }

  async findById(id: string): Promise<Hero | null> {
    const record = await this.prisma.hero.findUnique({ where: { id } });
    return record ? toEntity(record) : null;
  }

  async update(id: string, data: EditableHeroFields): Promise<Hero> {
    const record = await this.prisma.hero.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.nickname !== undefined ? { nickname: data.nickname } : {}),
        ...(data.date_of_birth !== undefined ? { date_of_birth: toDate(data.date_of_birth) } : {}),
        ...(data.universe !== undefined ? { universe: data.universe } : {}),
        ...(data.main_power !== undefined ? { main_power: data.main_power } : {}),
        ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url } : {}),
      },
    });
    return toEntity(record);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Hero> {
    const record = await this.prisma.hero.update({
      where: { id },
      data: { is_active: isActive },
    });
    return toEntity(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.hero.delete({ where: { id } });
  }
}
