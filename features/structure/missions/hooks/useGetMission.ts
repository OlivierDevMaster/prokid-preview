import { useQuery } from '@tanstack/react-query';

import { getStructureMission } from '../services/mission.service';

export function useGetMission(missionId: null | string | undefined) {
  return useQuery({
    enabled: !!missionId,
    queryFn: async () => {
      if (!missionId) {
        throw new Error('Mission ID is required');
      }
      return getStructureMission(missionId);
    },
    queryKey: ['structure-mission', missionId],
  });
}
