import type { Mission, MissionFilters } from '@/features/missions/mission.model';

import { updateMission } from '@/features/missions/mission.service';
import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';

import type { StructureMission } from '../modeles/mission.modele';

import type { CreateMissionRequestBody } from '@/features/missions/mission.model';

export const getStructureMissions = async (
  structureId: string,
  filters: Omit<MissionFilters, 'structure_id'> = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<StructureMission>> => {
  const supabase = createClient();

  let query = supabase
    .from('missions')
    .select(
      `
      *,
      professional:professionals!missions_professional_id_fkey(
        *,
        profile:profiles!professionals_user_id_fkey(*)
      )
    `,
      { count: 'exact' }
    )
    .eq('structure_id', structureId);

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
    data: (data ?? []) as StructureMission[],
  };
};

export const getStructureMission = async (
  missionId: string
): Promise<null | StructureMission> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('missions')
    .select(
      `
      *,
      professional:professionals!missions_professional_id_fkey(
        *,
        profile:profiles!professionals_user_id_fkey(*)
      )
    `
    )
    .eq('id', missionId)
    .maybeSingle();

  if (error) throw error;

  return data as null | StructureMission;
};

import type { UpdateMissionRequestBody } from '@/features/missions/mission.service';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

export const updateStructureMission = async (
  missionId: string,
  updateData: UpdateMissionRequestBody
) => {
  return updateMission(missionId, updateData);
};

export const deleteStructureMission = async (missionId: string) => {
  const supabase = createClient();

  const { error } = await supabase
    .from('missions')
    .delete()
    .eq('id', missionId);

  if (error) throw error;
};


