import { useQuery } from '@tanstack/react-query';

import { getExperiencesByUserId } from '../experience.service';

export const useGetExperiences = (
  userId: null | string | undefined
) => {
  return useQuery({
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return getExperiencesByUserId(userId);
    },
    queryKey: ['professional-experiences', userId],
  });
};
