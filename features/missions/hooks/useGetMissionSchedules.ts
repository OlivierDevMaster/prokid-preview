import { useQuery } from '@tanstack/react-query';

import { getMissionSchedules } from '../mission-schedule.service';

export const useGetMissionSchedules = (
  missionId: null | string | undefined
) => {
  return useQuery({
    enabled: !!missionId,
    queryFn: async () => {
      if (!missionId) {
        throw new Error('Mission ID is required');
      }
      return getMissionSchedules(missionId);
    },
    queryKey: ['mission-schedules', missionId],
  });
};
