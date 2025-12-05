import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AvailabilityInsert } from '@/features/availabilities/availability.model';

import { createAvailability } from '../availability.service';

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insertData: AvailabilityInsert) => {
      return createAvailability(insertData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
};
