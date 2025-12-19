import type { Tables, TablesUpdate } from '@/types/database/schema';

export type Profile = Tables<'profiles'>;

export type ProfileUpdate = TablesUpdate<'profiles'>;
