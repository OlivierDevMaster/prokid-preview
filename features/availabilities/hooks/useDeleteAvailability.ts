import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAvailability } from '../availability.service';

export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availabilityId: string) => {
      return deleteAvailability(availabilityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
};
