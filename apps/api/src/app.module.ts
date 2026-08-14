import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

// HeroesModule is registered in a later implementation phase (see tasks.md
// Phase 7); this module intentionally imports only the persistence
// foundation established in this phase.
@Module({
  imports: [PrismaModule],
})
export class AppModule {}
