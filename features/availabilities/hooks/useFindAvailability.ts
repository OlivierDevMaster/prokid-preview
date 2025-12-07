import { useQuery } from '@tanstack/react-query';

import { Availability } from '@/features/availabilities/availability.model';

import { findAvailability } from '../availability.service';

export const useFindAvailability = (
  availabilityId: null | string | undefined
) => {
  return useQuery<Availability | null, Error>({
    enabled: !!availabilityId,
    queryFn: async () => {
      if (!availabilityId) {
        return null;
      }

      const availability = await findAvailability(availabilityId);

      return availability;
    },
    queryKey: ['availability', availabilityId],
  });
};
