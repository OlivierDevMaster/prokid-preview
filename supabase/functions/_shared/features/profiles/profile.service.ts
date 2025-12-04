import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '../../../../../types/database/schema.ts';
import { Role } from '../roles/role.model.ts';
import { Profile, ProfileUpdate } from './profile.model.ts';

export const isProfileAdmin = (profile: Profile): boolean => {
  return profile.role === Role.admin;
};

export const isProfileProfessional = (profile: Profile): boolean => {
  return profile.role === Role.professional;
};

export const isProfileStructure = (profile: Profile): boolean => {
  return profile.role === Role.structure;
};

export const findProfile = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<null | Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const updateProfile = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  updateData: ProfileUpdate
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return data;
};
