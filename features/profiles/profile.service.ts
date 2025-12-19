import type { TablesUpdate } from '@/types/database/schema';

import { createClient } from '@/lib/supabase/client';

export type ProfileUpdate = TablesUpdate<'profiles'>;

export const updateProfile = async (
  userId: string,
  updateData: ProfileUpdate
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
};
