import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export type Professional = {
  profile: Tables<'profiles'>;
} & Tables<'professionals'>;

export interface ProfessionalFilters {
  locationSearch?: string;
  search?: string;
  skills?: string[];
}

export type ProfessionalInsert = TablesInsert<'professionals'>;

export type ProfessionalUpdate = TablesUpdate<'professionals'>;
