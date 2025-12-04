import type { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '../../../../../types/database/schema.ts';
import {
  Professional,
  ProfessionalInsert,
  ProfessionalUpdate,
} from './professional.model.ts';

export const createProfessional = async (
  supabase: SupabaseClient<Database>,
  insertData: ProfessionalInsert
): Promise<Professional> => {
  const { data, error } = await supabase
    .from('professionals')
    .insert(insertData)
    .select(
      `
        *,
        profile:profiles(*)
      `
    )
    .single();

  if (error) throw error;

  return data;
};

export const findProfessional = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<null | Professional> => {
  const { data, error } = await supabase
    .from('professionals')
    .select(
      `
        *,
        profile:profiles(*)
      `
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const updateProfessional = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  updateData: ProfessionalUpdate
): Promise<Professional> => {
  const { data, error } = await supabase
    .from('professionals')
    .update(updateData)
    .eq('user_id', userId)
    .select(
      `
        *,
        profile:profiles(*)
      `
    )
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return data;
};
