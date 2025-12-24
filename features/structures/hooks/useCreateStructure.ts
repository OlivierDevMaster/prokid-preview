import { useMutation, useQueryClient } from '@tanstack/react-query';

import { StructureInsert } from '@/features/structures/structure.model';

import { createStructure } from '../structure.service';

export const useCreateStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insertData: StructureInsert) => {
      return createStructure(insertData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structures'] });
    },
  });
};
