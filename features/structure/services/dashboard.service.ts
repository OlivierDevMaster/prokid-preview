import { MissionStatus } from '@/features/missions/mission.model';
import { ReportStatus } from '@/features/reports/report.model';
import { InvitationStatus } from '@/features/structure-invitations/structureInvitation.model';
import { createClient } from '@/lib/supabase/client';

export async function getStructureActiveMembersCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('structure_members')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .is('deleted_at', null);

  if (error) throw error;

  return count ?? 0;
}

export async function getStructureActiveMissionsCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .eq('status', MissionStatus.accepted);

  if (error) throw error;

  return count ?? 0;
}

export async function getStructureMissionsCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId);

  if (error) throw error;

  return count ?? 0;
}

export async function getStructurePendingInvitationsCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('structure_invitations')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .eq('status', InvitationStatus.pending);

  if (error) throw error;

  return count ?? 0;
}

export async function getStructurePendingMissionsCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .eq('status', MissionStatus.pending);

  if (error) throw error;

  return count ?? 0;
}

export async function getStructureReceivedReportsCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  // First, get all mission IDs for this structure
  const { data: missions, error: missionsError } = await supabase
    .from('missions')
    .select('id')
    .eq('structure_id', structureId);

  if (missionsError) throw missionsError;

  const missionIds = missions?.map(m => m.id) ?? [];

  if (missionIds.length === 0) {
    return 0;
  }

  // Then count reports for these missions with status 'sent'
  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .in('mission_id', missionIds)
    .eq('status', ReportStatus.sent);

  if (error) throw error;

  return count ?? 0;
}
