import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfessionalRating } from '../ratings.model';

import { updateRating } from '../services/rating.service';

export interface UpdateRatingParams {
  comment?: null | string;
  rating: number;
  ratingId: string;
}

export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfessionalRating, Error, UpdateRatingParams>({
    mutationFn: async (
      params: UpdateRatingParams
    ): Promise<ProfessionalRating> => {
      return updateRating(params.ratingId, params.rating, params.comment);
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
