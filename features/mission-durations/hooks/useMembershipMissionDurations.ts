'use client';

import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';

import { getMissionDurations } from '../services/missionDuration.service';

export const useMembershipMissionDurations = (
  professionalId: null | string,
  structureId: null | string
) => {
  return useQuery({
    enabled: !!professionalId && !!structureId,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!professionalId || !structureId) {
        throw new Error('professionalId and structureId are required');
      }
      return getMissionDurations(professionalId, structureId);
    },
    queryKey: ['mission-durations', 'membership', professionalId, structureId],
  });
};
