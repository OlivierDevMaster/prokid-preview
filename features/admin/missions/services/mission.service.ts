import type {
  Mission,
  MissionFilters,
} from '@/features/missions/mission.model';

import { MissionConfig } from '@/features/missions/mission.config';
import { MissionColumn } from '@/features/missions/mission.model';
import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/utils/enums';

export type AdminMission = {
  professional: {
    city: null | string;
    profile: {
      avatar_url: null | string;
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
          avatar_url,
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
          avatar_url,
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

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
    query = query.ilike('description', `%${filters.search}%`);
  }

  const page = paginationOptions.page ?? MissionConfig.PAGE_DEFAULT;
  const limit = paginationOptions.limit ?? MissionConfig.PAGE_SIZE_DEFAULT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Apply sorting
  const sortColumn = filters.sort || MissionColumn.created_at;
  const sortOrder = filters.order || Order.desc;
  const ascending = sortOrder === Order.asc;

  if (sortColumn === 'title') {
    // Special handling for title sorting (uses title field directly)
    query = query.order('title', { ascending });
  } else {
    // For other columns, use the column directly
    query = query.order(sortColumn, { ascending });
    // Add secondary sort by id for consistency
    query = query.order(MissionColumn.id, { ascending });
  }

  query = query.range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as AdminMission[],
  };
}
