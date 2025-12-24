import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../../../../types/database/schema.ts';

export type Profile = Tables<'profiles'>;

export type ProfileInsert = TablesInsert<'profiles'>;

export type ProfileUpdate = TablesUpdate<'profiles'>;
