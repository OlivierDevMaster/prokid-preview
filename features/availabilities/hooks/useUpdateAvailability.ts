import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AvailabilityUpdate } from '@/features/availabilities/availability.model';

import { updateAvailability } from '../availability.service';

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      availabilityId,
      updateData,
    }: {
      availabilityId: string;
      updateData: AvailabilityUpdate;
    }) => {
      return updateAvailability(availabilityId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
};
