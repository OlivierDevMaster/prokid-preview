import { useQuery } from '@tanstack/react-query';

import { Structure } from '@/features/structures/structure.model';

import { findStructure } from '../structure.service';

export const useFindStructure = (userId: null | string | undefined) => {
  return useQuery<null | Structure, Error>({
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const structure = await findStructure(userId);

      return structure;
    },
    queryKey: ['structure', userId],
  });
};
