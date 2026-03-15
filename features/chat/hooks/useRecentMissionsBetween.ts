import { useQuery } from '@tanstack/react-query';

import { findMissions } from '@/features/missions/mission.service';

const LIMIT = 3;

export function useRecentMissionsBetween(
  structureId: null | string,
  professionalId: null | string
) {
  const query = useQuery({
    enabled: !!structureId && !!professionalId,
    queryFn: async () => {
      const result = await findMissions(
        { professional_id: professionalId!, structure_id: structureId! },
        { limit: LIMIT }
      );
      return result.data;
    },
    queryKey: ['chat-recent-missions', structureId, professionalId],
  });

  return {
    data: query.data ?? [],
    error: query.error,
    isLoading: query.isLoading,
  };
}
