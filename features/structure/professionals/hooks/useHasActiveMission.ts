import { useQuery } from '@tanstack/react-query';

import { checkProfessionalAvailability } from '@/features/missions/mission.service';

/**
 * Hook to check if a professional has an active mission
 * A mission is considered active if it's accepted and the current date
 * is within the mission date range (mission_dtstart <= now <= mission_until)
 *
 * This hook uses a database function that bypasses RLS to allow structures
 * to check availability of their members without accessing mission data from other structures.
 */
export function useHasActiveMission(professionalId: string | undefined) {
  return useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        return false;
      }

      // Use the database function that bypasses RLS
      // This allows structures to check availability without exposing mission details
      const result = await checkProfessionalAvailability(professionalId);

      // If result is null (error or invalid caller), return false
      return result ?? false;
    },
    queryKey: ['professional-active-mission', professionalId],
  });
}
