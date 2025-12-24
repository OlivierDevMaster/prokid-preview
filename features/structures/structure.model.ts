import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export type Structure = {
  profile: Tables<'profiles'>;
} & Tables<'structures'>;

export interface StructureFilters {
  locationSearch?: string;
  search?: string;
  skills?: string[];
}

export type StructureInsert = TablesInsert<'structures'>;

export type StructureUpdate = TablesUpdate<'structures'>;
