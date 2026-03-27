import { createClient } from '@/lib/supabase/client';

import type {
  ProfessionalCertification,
  ProfessionalCertificationInsert,
  ProfessionalCertificationUpdate,
} from './certification.model';

export const getCertificationsByUserId = async (
  userId: string
): Promise<ProfessionalCertification[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professional_certifications')
    .select('*')
    .eq('user_id', userId)
    .order('year_obtained', { ascending: false });

  if (error) throw error;

  return data ?? [];
};

export const createCertification = async (
  certification: ProfessionalCertificationInsert
): Promise<ProfessionalCertification> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professional_certifications')
    .insert(certification)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const updateCertification = async (
  certificationId: string,
  updateData: ProfessionalCertificationUpdate
): Promise<ProfessionalCertification> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professional_certifications')
    .update(updateData)
    .eq('id', certificationId)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const deleteCertification = async (
  certificationId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('professional_certifications')
    .delete()
    .eq('id', certificationId);

  if (error) throw error;
};
