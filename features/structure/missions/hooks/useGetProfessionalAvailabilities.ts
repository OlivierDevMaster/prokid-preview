import { useQuery } from '@tanstack/react-query';

import { getAvailabilities } from '@/features/availabilities/availability.service';

export function useGetProfessionalAvailabilities(
  professionalId: null | string
) {
  return useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        return { count: 0, data: [] };
      }
      return getAvailabilities(
        { userId: professionalId },
        { limit: 1000, page: 1 }
      );
    },
    queryKey: ['professional-availabilities', professionalId],
  });
}
