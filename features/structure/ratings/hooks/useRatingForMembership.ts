import { useQuery } from '@tanstack/react-query';

import type { ProfessionalRatingWithRelations } from '../ratings.model';

import { getRatingForMembership } from '../services/rating.service';

export const useRatingForMembership = (membershipId: string | undefined) => {
  return useQuery<null | ProfessionalRatingWithRelations, Error>({
    enabled: !!membershipId,
    queryFn: async (): Promise<null | ProfessionalRatingWithRelations> => {
      if (!membershipId) {
        return null;
      }
      return getRatingForMembership(membershipId);
    },
    queryKey: ['rating-for-membership', membershipId],
  });
};
