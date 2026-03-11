import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfessionalRating } from '../ratings.model';

import { createRating } from '../services/rating.service';

export interface CreateRatingParams {
  comment?: null | string;
  professionalId: string;
  rating: number;
  structureId: string;
}

export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfessionalRating, Error, CreateRatingParams>({
    mutationFn: async (
      params: CreateRatingParams
    ): Promise<ProfessionalRating> => {
      return createRating(
        params.structureId,
        params.professionalId,
        params.rating,
        params.comment
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-ratings'] });
      queryClient.invalidateQueries({
        queryKey: ['rating-for-structure-professional'],
      });
      queryClient.invalidateQueries({ queryKey: ['ratings-for-professional'] });
      queryClient.invalidateQueries({ queryKey: ['ratings-for-structure'] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
};
