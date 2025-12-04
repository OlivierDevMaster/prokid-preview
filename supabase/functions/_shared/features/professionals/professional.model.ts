import {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../../../../types/database/schema.ts';

export type Professional = {
  profile: Tables<'profiles'>;
} & Tables<'professionals'>;
export type ProfessionalInsert = TablesInsert<'professionals'>;
export type ProfessionalUpdate = TablesUpdate<'professionals'>;
