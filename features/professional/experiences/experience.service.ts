import { createClient } from '@/lib/supabase/client';

import type {
  ProfessionalExperience,
  ProfessionalExperienceInsert,
  ProfessionalExperienceUpdate,
} from './experience.model';

export const getExperiencesByUserId = async (
  userId: string
): Promise<ProfessionalExperience[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professional_experiences')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) throw error;

  return data ?? [];
};

export const createExperience = async (
  experience: ProfessionalExperienceInsert
): Promise<ProfessionalExperience> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professional_experiences')
    .insert(experience)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const updateExperience = async (
  experienceId: string,
  updateData: ProfessionalExperienceUpdate
): Promise<ProfessionalExperience> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professional_experiences')
    .update(updateData)
    .eq('id', experienceId)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const deleteExperience = async (
  experienceId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('professional_experiences')
    .delete()
    .eq('id', experienceId);

  if (error) throw error;
};
