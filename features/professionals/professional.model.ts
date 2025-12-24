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

export type ProfessionalsWithProfilesSearch = {
  avatar_url: null | string;
  first_name: null | string;
  is_onboarded: boolean;
  last_name: null | string;
  profile_created_at: string;
  profile_email: string;
  profile_role: Tables<'profiles'>['role'];
} & Tables<'professionals'>;

export type ProfessionalUpdate = TablesUpdate<'professionals'>;
