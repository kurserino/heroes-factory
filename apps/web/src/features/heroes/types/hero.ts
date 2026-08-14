// Mirrors the backend's exact 10-field API representation (contracts/heroes-api.md).
// snake_case is used verbatim to match the wire format, with no camelCase
// mapping layer (matches the convention adopted in apps/api's DTOs/entity).
export interface Hero {
  id: string;
  name: string;
  nickname: string;
  date_of_birth: string;
  universe: string;
  main_power: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HeroListResponse {
  data: Hero[];
  pagination: PaginationMeta;
}
