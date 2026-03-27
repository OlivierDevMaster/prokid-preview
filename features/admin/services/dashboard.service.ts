import { startOfMonth } from 'date-fns';

import { MissionStatus } from '@/features/missions/mission.model';
import { InvitationStatus } from '@/features/structure-invitations/structureInvitation.model';
import { createClient } from '@/lib/supabase/client';

export interface MostActiveProfessional {
  avatarUrl: null | string;
  missionCount: number;
  professionalName: string;
  userId: string;
}

export interface MostActiveStructure {
  avatarUrl: null | string;
  missionCount: number;
  structureName: string;
  userId: string;
}

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

  const { count, error } = await supabase
    .from('professionals')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminActiveStructuresCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('structures')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminAverageMissionsPerStructure(): Promise<number> {
  const supabase = createClient();

  // Get total missions count
  const { count: missionsCount, error: missionsError } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true });

  if (missionsError) throw missionsError;

  // Get total structures count
  const { count: structuresCount, error: structuresError } = await supabase
    .from('structures')
    .select('*', { count: 'exact', head: true });

  if (structuresError) throw structuresError;

  if ((structuresCount ?? 0) === 0) {
    return 0;
  }

  return Math.round(((missionsCount ?? 0) / (structuresCount ?? 0)) * 10) / 10;
}

export async function getAdminAverageProfessionalsPerStructure(): Promise<number> {
  const supabase = createClient();

  const { count: professionalsCount, error: professionalsError } =
    await supabase.from('professionals').select('*', {
      count: 'exact',
      head: true,
    });

  if (professionalsError) throw professionalsError;

  const { count: structuresCount, error: structuresError } = await supabase
    .from('structures')
    .select('*', { count: 'exact', head: true });

  if (structuresError) throw structuresError;

  if ((structuresCount ?? 0) === 0) {
    return 0;
  }

  return (
    Math.round(((professionalsCount ?? 0) / (structuresCount ?? 0)) * 10) / 10
  );
}

export async function getAdminCompletedMissionsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('status', MissionStatus.ended);

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminMissionCompletionRate(): Promise<number> {
  const supabase = createClient();

  // Get completed missions count
  const { count: completedCount, error: completedError } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('status', MissionStatus.ended);

  if (completedError) throw completedError;

  // Get total missions count
  const { count: totalCount, error: totalError } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true });

  if (totalError) throw totalError;

  if ((totalCount ?? 0) === 0) {
    return 0;
  }

  return Math.round(((completedCount ?? 0) / (totalCount ?? 0)) * 100);
}

export async function getAdminMissionsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminMostActiveProfessional(): Promise<MostActiveProfessional | null> {
  const supabase = createClient();

  // Get missions with dates to count and track most recent activity
  const { data: missions, error: missionsError } = await supabase
    .from('missions')
    .select('professional_id, created_at')
    .order('created_at', { ascending: false });

  if (missionsError) throw missionsError;

  // Count missions per professional AND track most recent mission date
  const professionalData = new Map<
    string,
    { count: number; mostRecent: Date }
  >();

  missions?.forEach(mission => {
    const existing = professionalData.get(mission.professional_id) ?? {
      count: 0,
      mostRecent: new Date(0),
    };
    const missionDate = new Date(mission.created_at);
    professionalData.set(mission.professional_id, {
      count: existing.count + 1,
      mostRecent:
        missionDate > existing.mostRecent ? missionDate : existing.mostRecent,
    });
  });

  if (professionalData.size === 0) {
    return null;
  }

  // Find professional with most missions, breaking ties by most recent activity
  let maxCount = 0;
  let mostRecentDate = new Date(0);
  let mostActiveProfessionalId = '';

  for (const [professionalId, data] of professionalData.entries()) {
    if (
      data.count > maxCount ||
      (data.count === maxCount && data.mostRecent > mostRecentDate)
    ) {
      maxCount = data.count;
      mostRecentDate = data.mostRecent;
      mostActiveProfessionalId = professionalId;
    }
  }

  // Get professional name and avatar from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('user_id', mostActiveProfessionalId)
    .single();

  if (profileError) throw profileError;

  const professionalName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : 'Unknown';

  return {
    avatarUrl: profile?.avatar_url ?? null,
    missionCount: maxCount,
    professionalName,
    userId: mostActiveProfessionalId,
  };
}

export async function getAdminMostActiveStructure(): Promise<MostActiveStructure | null> {
  const supabase = createClient();

  // Get missions with dates to count and track most recent activity
  const { data: missions, error: missionsError } = await supabase
    .from('missions')
    .select('structure_id, created_at')
    .order('created_at', { ascending: false });

  if (missionsError) throw missionsError;

  // Count missions per structure AND track most recent mission date
  const structureData = new Map<string, { count: number; mostRecent: Date }>();

  missions?.forEach(mission => {
    const existing = structureData.get(mission.structure_id) ?? {
      count: 0,
      mostRecent: new Date(0),
    };
    const missionDate = new Date(mission.created_at);
    structureData.set(mission.structure_id, {
      count: existing.count + 1,
      mostRecent:
        missionDate > existing.mostRecent ? missionDate : existing.mostRecent,
    });
  });

  if (structureData.size === 0) {
    return null;
  }

  // Find structure with most missions, breaking ties by most recent activity
  let maxCount = 0;
  let mostRecentDate = new Date(0);
  let mostActiveStructureId = '';

  for (const [structureId, data] of structureData.entries()) {
    if (
      data.count > maxCount ||
      (data.count === maxCount && data.mostRecent > mostRecentDate)
    ) {
      maxCount = data.count;
      mostRecentDate = data.mostRecent;
      mostActiveStructureId = structureId;
    }
  }

  // Get structure name and avatar from profile
  const { data: structure, error: structureError } = await supabase
    .from('structures')
    .select('name, user_id')
    .eq('user_id', mostActiveStructureId)
    .single();

  if (structureError) throw structureError;

  const structureName = structure?.name ?? 'Unknown';

  // Get avatar from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', mostActiveStructureId)
    .single();

  if (profileError) throw profileError;

  return {
    avatarUrl: profile?.avatar_url ?? null,
    missionCount: maxCount,
    structureName,
    userId: mostActiveStructureId,
  };
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

export async function getAdminSystemGrowthRate(): Promise<number> {
  const supabase = createClient();

  const startOfCurrentMonth = startOfMonth(new Date()).toISOString();

  const { count, error } = await supabase
    .from('professionals')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfCurrentMonth);

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminStructureGrowthRate(): Promise<number> {
  const supabase = createClient();
  const startOfCurrentMonth = startOfMonth(new Date()).toISOString();

  const { count, error } = await supabase
    .from('structures')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfCurrentMonth);

  if (error) throw error;
  return count ?? 0;
}

export async function getAdminPremiumProfessionalsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('professionals')
    .select('*', { count: 'exact', head: true })
    .not('stripe_customer_id', 'is', null);

  if (error) throw error;
  return count ?? 0;
}

export async function getAdminRegionBreakdown(): Promise<Array<{ city: string; proCount: number; structCount: number; total: number }>> {
  const supabase = createClient();

  const { data: proCities } = await supabase
    .from('professionals')
    .select('city')
    .not('city', 'is', null);

  const { data: structCities } = await supabase
    .from('structures')
    .select('city')
    .not('city', 'is', null);

  const cityMap = new Map<string, { pro: number; struct: number }>();

  for (const row of (proCities || [])) {
    const city = (row.city || '').trim();
    if (city) {
      const existing = cityMap.get(city) || { pro: 0, struct: 0 };
      existing.pro++;
      cityMap.set(city, existing);
    }
  }

  for (const row of (structCities || [])) {
    const city = (row.city || '').trim();
    if (city) {
      const existing = cityMap.get(city) || { pro: 0, struct: 0 };
      existing.struct++;
      cityMap.set(city, existing);
    }
  }

  return Array.from(cityMap.entries())
    .map(([city, counts]) => ({ city, proCount: counts.pro, structCount: counts.struct, total: counts.pro + counts.struct }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

export async function getAdminTotalInvitationsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('structure_invitations')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  return count ?? 0;
}

export async function getAdminTotalReportsCount(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;

  return count ?? 0;
}
