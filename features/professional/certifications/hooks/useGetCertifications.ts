import { useQuery } from '@tanstack/react-query';

import { getCertificationsByUserId } from '../certification.service';

export const useGetCertifications = (
  userId: null | string | undefined
) => {
  return useQuery({
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return getCertificationsByUserId(userId);
    },
    queryKey: ['professional-certifications', userId],
  });
};
