import { useQuery } from '@tanstack/react-query';

import type { MissionWithStructure } from '@/features/missions/mission.model';

import { getProfessionalMission } from '@/features/missions/mission.service';

export function useGetProfessionalMission(
  missionId: null | string | undefined
) {
  return useQuery<MissionWithStructure | null>({
    enabled: !!missionId,
    queryFn: async () => {
      if (!missionId) {
        return null;
      }
      return getProfessionalMission(missionId);
    },
    queryKey: ['professional-mission', missionId],
  });
}
