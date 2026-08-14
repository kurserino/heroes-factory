import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { IsNotFutureDate } from '../../common/validators/is-not-future-date.validator';

export class CreateHeroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nickname!: string;

  @IsDateString()
  @IsNotFutureDate()
  date_of_birth!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  universe!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  main_power!: string;

  @IsUrl({ require_protocol: true })
  avatar_url!: string;
}
