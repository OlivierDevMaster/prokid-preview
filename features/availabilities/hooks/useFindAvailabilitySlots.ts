import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { AvailabilitySlotFilters } from '@/features/availabilities/availability.model';

import { findAvailabilitySlots } from '../availability.service';

export const useFindAvailabilitySlots = (
  filters: Partial<AvailabilitySlotFilters> = {}
) => {
  return useQuery({
    enabled: !!filters.endAt && !!filters.professionalId && !!filters.startAt,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!filters.endAt || !filters.professionalId || !filters.startAt) {
        return [];
      }

      return findAvailabilitySlots({
        endAt: filters.endAt,
        professionalId: filters.professionalId,
        startAt: filters.startAt,
      });
    },
    queryKey: ['availability-slots', filters],
  });
};
