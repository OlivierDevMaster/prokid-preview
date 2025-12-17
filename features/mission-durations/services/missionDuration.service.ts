import { createClient } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

import type { MissionDurations } from '../missionDuration.model';

export const getMissionDurations = async (
  professionalId: string,
  structureId: string
): Promise<MissionDurations> => {
  const supabase = createClient();

  return invokeEdgeFunction<MissionDurations>(supabase, 'mission-durations', {
    method: 'GET',
    path: '/membership',
    queryParams: {
      professional_id: professionalId,
      structure_id: structureId,
    },
  });
};

export const getMissionDuration = async (
  missionId: string
): Promise<MissionDurations> => {
  const supabase = createClient();

  return invokeEdgeFunction<MissionDurations>(supabase, 'mission-durations', {
    method: 'GET',
    path: '/mission',
    queryParams: {
      mission_id: missionId,
    },
  });
};
