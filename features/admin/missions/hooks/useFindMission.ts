import { useQuery } from '@tanstack/react-query';

import { getAdminMission } from '../services/mission.service';

export const useFindMission = (missionId: null | string) => {
  return useQuery({
    enabled: missionId !== null,
    queryFn: async () => {
      if (!missionId) return null;
      return getAdminMission(missionId);
    },
    queryKey: ['admin', 'mission', missionId],
  });
};
