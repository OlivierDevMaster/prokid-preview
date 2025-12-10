import { createClient } from '@/lib/supabase/client';

import { Structure } from '../modeles/Structure.modele';

export async function getProfessionalStructures(userId: string) {
  try {
    const supabase = createClient();
    const { data: structures, error } = await supabase
      .from('structures')
      .select(
        `
          *,
          profile:profiles(*)
        `
      )
      .eq('user_id', userId);

    if (error) throw error;

    return {
      data: structures,
    };
  } catch (error) {
    throw error;
  }
}

export async function getStructures(): Promise<Structure[]> {
  try {
    const supabase = createClient();
    const { data: structures, error } = await supabase
      .from('structures')
      .select(
        `
          *,
          profile:profiles(*)
        `
      );

    if (error) throw error;

    return structures ?? [];
  } catch (error) {
    throw error;
  }
}
