import { useQuery } from '@tanstack/react-query';

import { MissionStatus } from '@/features/missions/mission.model';
import { findMissions } from '@/features/missions/mission.service';

/**
 * Hook to check if a professional has an active mission
 * A mission is considered active if it's accepted and the current date
 * is within the mission date range (mission_dtstart <= now <= mission_until)
 */
export function useHasActiveMission(
  professionalId: string | undefined,
  structureId: string | undefined
) {
  return useQuery({
    enabled: !!professionalId && !!structureId,
    queryFn: async () => {
      if (!professionalId || !structureId) {
        return false;
      }

      const now = new Date();

      // Get accepted missions for this professional and structure
      const result = await findMissions(
        {
          professional_id: professionalId,
          status: MissionStatus.accepted,
          structure_id: structureId,
        },
        {}
      );

      // Check if any mission is currently active
      const hasActiveMission = result.data.some(mission => {
        const startDate = new Date(mission.mission_dtstart);
        const endDate = new Date(mission.mission_until);
        return now >= startDate && now <= endDate;
      });

      return hasActiveMission;
    },
    queryKey: ['professional-active-mission', professionalId, structureId],
  });
}
