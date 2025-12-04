import { useQuery } from '@tanstack/react-query';

import { Professional } from '@/features/professionals/professional.model';

import { findProfessional } from '../professional.service';

export const useFindProfessional = (
  professionalId: null | string | undefined
) => {
  return useQuery<null | Professional, Error>({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        return null;
      }

      const professional = await findProfessional(professionalId);

      return professional;
    },
    queryKey: ['professional', professionalId],
  });
};
