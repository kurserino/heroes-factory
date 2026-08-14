import { Module } from '@nestjs/common';
import { AvatarUrlValidator } from './avatar-url-validator';
import { HeroesController } from './heroes.controller';
import { HEROES_REPOSITORY } from './heroes.repository';
import { HeroesService } from './heroes.service';
import { PrismaHeroesRepository } from './prisma-heroes.repository';

@Module({
  controllers: [HeroesController],
  providers: [
    HeroesService,
    AvatarUrlValidator,
    { provide: HEROES_REPOSITORY, useClass: PrismaHeroesRepository },
  ],
})
export class HeroesModule {}
