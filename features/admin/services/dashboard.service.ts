import { MissionStatus } from '@/features/missions/mission.model';
import { InvitationStatus } from '@/features/structure-invitations/structureInvitation.model';
import { createClient } from '@/lib/supabase/client';

export async function getAdminActiveMissionsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('status', MissionStatus.accepted);

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminActiveProfessionalsCount(): Promise<number> {
  const supabase = createClient();

  // Active professionals are those with at least one structure membership (not deleted)
  // Get distinct professional IDs
  const { data, error } = await supabase
    .from('structure_members')
    .select('professional_id')
    .is('deleted_at', null);

  if (error) throw error;

  const uniqueProfessionalIds = new Set(
    data?.map(m => m.professional_id) ?? []
  );
  return uniqueProfessionalIds.size;
}

export async function getAdminActiveStructuresCount(): Promise<number> {
  const supabase = createClient();

  // Active structures are those with at least one professional member (not deleted)
  const { data, error } = await supabase
    .from('structure_members')
    .select('structure_id')
    .is('deleted_at', null);

  if (error) throw error;

  const uniqueStructureIds = new Set(data?.map(m => m.structure_id) ?? []);
  return uniqueStructureIds.size;
}

export async function getAdminMissionsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminPendingInvitationsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('structure_invitations')
    .select('*', { count: 'exact', head: true })
    .eq('status', InvitationStatus.pending);

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminPendingMissionsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('status', MissionStatus.pending);

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminProfessionalsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('professionals')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminStructuresCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('structures')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  return count ?? 0;
}
