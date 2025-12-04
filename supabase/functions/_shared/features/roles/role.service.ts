import type { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '../../../../../types/database/schema.ts';
import { Role } from './role.model.ts';

export const isAdmin = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === Role.admin;
};

export const isProfessional = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === Role.professional;
};

export const isStructure = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === Role.structure;
};
