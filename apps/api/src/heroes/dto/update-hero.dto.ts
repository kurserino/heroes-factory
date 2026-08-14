import { PartialType } from '@nestjs/mapped-types';
import { CreateHeroDto } from './create-hero.dto';

// Restricted to the 6 editable fields (name, nickname, date_of_birth,
// universe, main_power, avatar_url); is_active is intentionally absent so it
// can never be changed through this endpoint (see PATCH /heroes/:id/status).
export class UpdateHeroDto extends PartialType(CreateHeroDto) {}
