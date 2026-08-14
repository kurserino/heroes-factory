import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateHeroDto } from './dto/create-hero.dto';
import { ListHeroesQueryDto } from './dto/list-heroes-query.dto';
import { UpdateHeroStatusDto } from './dto/update-hero-status.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { Hero } from './entities/hero.entity';
import { HeroesService, PaginatedHeroes } from './heroes.service';

@Controller('heroes')
export class HeroesController {
  constructor(private readonly heroesService: HeroesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateHeroDto): Promise<Hero> {
    return this.heroesService.create(dto);
  }

  @Get()
  list(@Query() query: ListHeroesQueryDto): Promise<PaginatedHeroes> {
    return this.heroesService.list(query.page ?? 1, query.search);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Hero> {
    return this.heroesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHeroDto,
  ): Promise<Hero> {
    return this.heroesService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateHeroStatusDto,
  ): Promise<Hero> {
    return this.heroesService.updateStatus(id, dto.is_active);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.heroesService.remove(id);
  }
}
