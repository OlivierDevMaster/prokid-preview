import { addDays } from 'date-fns';

import { MissionStatus } from '@/features/missions/mission.model';
import { ReportStatus } from '@/features/reports/report.model';
import { InvitationStatus } from '@/features/structure-invitations/structureInvitation.model';
import { createClient } from '@/lib/supabase/client';

export async function getStructureAcceptedInvitationsCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('structure_invitations')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .eq('status', InvitationStatus.accepted);

  if (error) throw error;

  return count ?? 0;
}

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

export async function getStructureCompletedMissionsCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .eq('status', MissionStatus.ended);

  if (error) throw error;

  return count ?? 0;
}

export async function getStructureMissionAcceptanceRate(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  // Get accepted missions count
  const { count: acceptedCount, error: acceptedError } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .eq('status', MissionStatus.accepted);

  if (acceptedError) throw acceptedError;

  // Get declined missions count
  const { count: declinedCount, error: declinedError } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .eq('status', MissionStatus.declined);

  if (declinedError) throw declinedError;

  const total = (acceptedCount ?? 0) + (declinedCount ?? 0);

  if (total === 0) {
    return 0;
  }

  return Math.round(((acceptedCount ?? 0) / total) * 100);
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

export async function getStructureUpcomingMissionsCount(
  structureId: string
): Promise<number> {
  const supabase = createClient();

  const now = new Date().toISOString();
  const thirtyDaysFromNow = addDays(new Date(), 30).toISOString();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', structureId)
    .gte('mission_dtstart', now)
    .lte('mission_dtstart', thirtyDaysFromNow)
    .in('status', [MissionStatus.pending, MissionStatus.accepted]);

  if (error) throw error;

  return count ?? 0;
}
