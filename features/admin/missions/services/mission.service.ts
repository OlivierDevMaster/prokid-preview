import type {
  Mission,
  MissionFilters,
} from '@/features/missions/mission.model';

import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';

export type AdminMission = {
  professional: {
    city: null | string;
    profile: {
      email: string;
      first_name: null | string;
      last_name: null | string;
    } | null;
    user_id: string;
  } | null;
  structure: {
    name: string;
    profile: {
      email: string;
      first_name: null | string;
      last_name: null | string;
    } | null;
    user_id: string;
  } | null;
} & Mission;

export async function getAdminMission(
  missionId: string
): Promise<AdminMission | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('missions')
    .select(
      `
      *,
      structure:structures!missions_structure_id_fkey(
        user_id,
        name,
        profile:profiles!structures_user_id_fkey(
          email,
          first_name,
          last_name
        )
      ),
      professional:professionals!missions_professional_id_fkey(
        user_id,
        city,
        profile:profiles!professionals_user_id_fkey(
          email,
          first_name,
          last_name
        )
      )
    `
    )
    .eq('id', missionId)
    .maybeSingle();

  if (error) throw error;

  return data as AdminMission | null;
}

export async function getAdminMissions(
  filters: MissionFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<AdminMission>> {
  const supabase = createClient();

  let query = supabase.from('missions').select(
    `
      *,
      structure:structures!missions_structure_id_fkey(
        user_id,
        name,
        profile:profiles!structures_user_id_fkey(
          email,
          first_name,
          last_name
        )
      ),
      professional:professionals!missions_professional_id_fkey(
        user_id,
        city,
        profile:profiles!professionals_user_id_fkey(
          email,
          first_name,
          last_name
        )
      )
    `,
    { count: 'exact' }
  );

  if (filters.structure_id) {
    query = query.eq('structure_id', filters.structure_id);
  }

  if (filters.professional_id) {
    query = query.eq('professional_id', filters.professional_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const page = paginationOptions.page ?? 1;
  const limit = paginationOptions.limit ?? 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as AdminMission[],
  };
}
