'use client';

import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';

import { getMissionDuration } from '../services/missionDuration.service';

export const useMissionDuration = (missionId: null | string) => {
  return useQuery({
    enabled: !!missionId,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!missionId) {
        throw new Error('missionId is required');
      }
      return getMissionDuration(missionId);
    },
    queryKey: ['mission-durations', 'mission', missionId],
  });
};
