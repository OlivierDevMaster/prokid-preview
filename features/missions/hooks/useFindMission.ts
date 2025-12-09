import { useQuery } from '@tanstack/react-query';

import { findMission } from '../mission.service';

export const useFindMission = (missionId: null | string) => {
  return useQuery({
    enabled: missionId !== null,
    queryFn: async () => {
      if (!missionId) return null;
      return findMission(missionId);
    },
    queryKey: ['mission', missionId],
  });
};
