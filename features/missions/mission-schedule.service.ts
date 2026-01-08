import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

import { createClient } from '@/lib/supabase/client';

export type MissionSchedule = Tables<'mission_schedules'>;
export type MissionScheduleInsert = TablesInsert<'mission_schedules'>;
export type MissionScheduleUpdate = TablesUpdate<'mission_schedules'>;

export const createMissionSchedule = async (
  schedule: MissionScheduleInsert
): Promise<{ id: string }> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mission_schedules')
    .insert(schedule)
    .select('id')
    .single();

  if (error) throw error;

  return { id: data.id };
};

export const createMissionSchedules = async (
  schedules: MissionScheduleInsert[]
): Promise<{ id: string }[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mission_schedules')
    .insert(schedules)
    .select('id');

  if (error) throw error;

  return data.map(s => ({ id: s.id }));
};

export const getMissionSchedules = async (
  missionId: string
): Promise<MissionSchedule[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mission_schedules')
    .select('*')
    .eq('mission_id', missionId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data ?? [];
};

export const updateMissionSchedule = async (
  scheduleId: string,
  updateData: MissionScheduleUpdate
): Promise<MissionSchedule> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mission_schedules')
    .update(updateData)
    .eq('id', scheduleId)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const deleteMissionSchedule = async (
  scheduleId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('mission_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) throw error;
};

export const deleteMissionSchedules = async (
  scheduleIds: string[]
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('mission_schedules')
    .delete()
    .in('id', scheduleIds);

  if (error) throw error;
};
