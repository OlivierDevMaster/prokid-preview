import type { TablesInsert } from '@/types/database/schema';

import { createClient } from '@/lib/supabase/client';

export type MissionScheduleInsert = TablesInsert<'mission_schedules'>;

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
