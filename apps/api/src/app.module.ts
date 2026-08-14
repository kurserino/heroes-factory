import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HeroesModule } from './heroes/heroes.module';

@Module({
  imports: [PrismaModule, HeroesModule],
})
export class AppModule {}
