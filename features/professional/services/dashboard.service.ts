import { addDays } from 'date-fns';

import { MissionStatus } from '@/features/missions/mission.model';
import { ReportStatus } from '@/features/reports/report.model';
import { createClient } from '@/lib/supabase/client';

export async function getProfessionalAcceptedMissionsCount(
  professionalId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', professionalId)
    .eq('status', MissionStatus.accepted);

  if (error) throw error;

  return count ?? 0;
}

export async function getProfessionalDraftReportsCount(
  professionalId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', professionalId)
    .eq('status', ReportStatus.draft);

  if (error) throw error;

  return count ?? 0;
}

export async function getProfessionalMissionsCount(
  professionalId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', professionalId);

  if (error) throw error;

  return count ?? 0;
}

export async function getProfessionalPendingMissionsCount(
  professionalId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', professionalId)
    .eq('status', MissionStatus.pending);

  if (error) throw error;

  return count ?? 0;
}

export async function getProfessionalReportsCount(
  professionalId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', professionalId);

  if (error) throw error;

  return count ?? 0;
}

export async function getProfessionalSentReportsCount(
  professionalId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', professionalId)
    .eq('status', ReportStatus.sent);

  if (error) throw error;

  return count ?? 0;
}

export async function getProfessionalStructuresCount(
  professionalId: string
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('structure_members')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', professionalId);

  if (error) throw error;

  return count ?? 0;
}

export async function getProfessionalUpcomingMissionsCount(
  professionalId: string
): Promise<number> {
  const supabase = createClient();

  const now = new Date().toISOString();
  const thirtyDaysFromNow = addDays(new Date(), 30).toISOString();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('professional_id', professionalId)
    .gte('mission_dtstart', now)
    .lte('mission_dtstart', thirtyDaysFromNow)
    .in('status', [MissionStatus.pending, MissionStatus.accepted]);

  if (error) throw error;

  return count ?? 0;
}
