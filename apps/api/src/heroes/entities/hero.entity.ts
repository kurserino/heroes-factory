// The exact 10-field API representation of a hero (FR-023). No `deleted_at`
// or other persisted deletion marker is ever part of this shape.
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
