import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

import type {
  CreateMissionRequestBody,
  Mission,
  MissionFilters,
  MissionUpdate,
  MissionWithStructure,
} from './mission.model';

import { MissionConfig } from './mission.config';

export const createMission = async (
  body: CreateMissionRequestBody
): Promise<Mission> => {
  const supabase = createClient();

  return invokeEdgeFunction<Mission, CreateMissionRequestBody>(
    supabase,
    'missions',
    {
      body: {
        description: body.description,
        mission_dtstart: body.mission_dtstart,
        mission_until: body.mission_until,
        professional_id: body.professional_id,
        schedules: body.schedules,
        status: body.status ?? 'pending',
        structure_id: body.structure_id,
        title: body.title,
      },
      method: 'POST',
    }
  );
};

export const findMission = async (
  missionId: string
): Promise<Mission | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const findMissions = async (
  filters: MissionFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<Mission>> => {
  const supabase = createClient();

  let query = supabase.from('missions').select('*', { count: 'exact' });

  if (filters.structure_id) {
    query = query.eq('structure_id', filters.structure_id);
  }

  if (filters.professional_id) {
    query = query.eq('professional_id', filters.professional_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const page = paginationOptions.page ?? MissionConfig.PAGE_DEFAULT;

  const limit = paginationOptions.limit ?? MissionConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: data ?? [],
  };
};

export const updateMission = async (
  missionId: string,
  updateData: MissionUpdate
): Promise<Mission> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('missions')
    .update(updateData)
    .eq('id', missionId)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const acceptMission = async (missionId: string): Promise<Mission> => {
  const supabase = createClient();

  return invokeEdgeFunction<Mission>(supabase, 'missions', {
    method: 'POST',
    path: `/${missionId}/accept`,
  });
};

export const declineMission = async (missionId: string): Promise<Mission> => {
  const supabase = createClient();

  return invokeEdgeFunction<Mission>(supabase, 'missions', {
    method: 'POST',
    path: `/${missionId}/decline`,
  });
};

export const cancelMission = async (missionId: string): Promise<Mission> => {
  const supabase = createClient();

  return invokeEdgeFunction<Mission>(supabase, 'missions', {
    method: 'POST',
    path: `/${missionId}/cancel`,
  });
};

export const getProfessionalMissions = async (
  professionalId: string,
  filters: Omit<MissionFilters, 'professional_id'> = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<MissionWithStructure>> => {
  const supabase = createClient();

  let query = supabase
    .from('missions')
    .select(
      `
      *,
      structure:structures!missions_structure_id_fkey(
        *,
        profile:profiles!structures_user_id_fkey(*)
      )
    `,
      { count: 'exact' }
    )
    .eq('professional_id', professionalId);

  if (filters.structure_id) {
    query = query.eq('structure_id', filters.structure_id);
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
    data: (data ?? []) as MissionWithStructure[],
  };
};

export const getProfessionalMission = async (
  missionId: string
): Promise<MissionWithStructure | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('missions')
    .select(
      `
      *,
      structure:structures!missions_structure_id_fkey(
        *,
        profile:profiles!structures_user_id_fkey(*)
      )
    `
    )
    .eq('id', missionId)
    .maybeSingle();

  if (error) throw error;

  return data as MissionWithStructure | null;
};
