import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRating } from '../services/rating.service';

export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (ratingId: string): Promise<void> => {
      return deleteRating(ratingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['rating-for-membership'] });
      queryClient.invalidateQueries({ queryKey: ['ratings-for-professional'] });
      queryClient.invalidateQueries({ queryKey: ['ratings-for-structure'] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
};
