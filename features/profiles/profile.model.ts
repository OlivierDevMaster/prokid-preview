import type { Tables, TablesUpdate } from '@/types/database/schema';

export type Profile = Tables<'profiles'>;

export type ProfileColumn = keyof Tables<'profiles'>;

export const ProfileColumn = {
  avatar_url: 'avatar_url',
  created_at: 'created_at',
  email: 'email',
  first_name: 'first_name',
  is_onboarded: 'is_onboarded',
  last_name: 'last_name',
  preferred_language: 'preferred_language',
  role: 'role',
  user_id: 'user_id',
} as const satisfies {
  [K in ProfileColumn]: K;
};

export const ProfileColumns: Readonly<ProfileColumn[]> = Object.freeze(
  Object.values(ProfileColumn)
);

export type ProfileUpdate = TablesUpdate<'profiles'>;
