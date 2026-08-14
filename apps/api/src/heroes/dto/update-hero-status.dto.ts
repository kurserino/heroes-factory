import { IsBoolean } from 'class-validator';

export class UpdateHeroStatusDto {
  @IsBoolean()
  is_active!: boolean;
}
