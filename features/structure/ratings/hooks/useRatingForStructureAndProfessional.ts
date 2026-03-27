import { useQuery } from '@tanstack/react-query';

import type { ProfessionalRatingWithRelations } from '../ratings.model';

import { getRatingForStructureAndProfessional } from '../services/rating.service';

export const useRatingForStructureAndProfessional = (
  structureId: string | undefined,
  professionalId: string | undefined,
  missionId?: string | undefined
) => {
  return useQuery<null | ProfessionalRatingWithRelations, Error>({
    enabled: !!structureId && !!professionalId,
    queryFn: async (): Promise<null | ProfessionalRatingWithRelations> => {
      if (!structureId || !professionalId) {
        return null;
      }
      return getRatingForStructureAndProfessional(structureId, professionalId, missionId);
    },
    queryKey: [
      'rating-for-structure-professional',
      structureId,
      professionalId,
      missionId,
    ],
  });
};
