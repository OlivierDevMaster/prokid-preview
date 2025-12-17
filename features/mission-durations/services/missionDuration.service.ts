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
    queryParams: {
      professional_id: professionalId,
      structure_id: structureId,
    },
  });
};
