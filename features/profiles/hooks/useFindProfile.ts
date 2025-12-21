import { useQuery } from '@tanstack/react-query';

import type { Profile } from '../profile.model';

import { findProfile } from '../profile.service';

export const useFindProfile = (userId: null | string | undefined) => {
  return useQuery<null | Profile, Error>({
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const profile = await findProfile(userId);

      return profile;
    },
    queryKey: ['profile', userId],
  });
};
