import { useMutation, useQueryClient } from '@tanstack/react-query';

import { StructureUpdate } from '@/features/structures/structure.model';

import { updateStructure } from '../structure.service';

export const useUpdateStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      updateData,
      userId,
    }: {
      updateData: StructureUpdate;
      userId: string;
    }) => {
      return updateStructure(userId, updateData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['structures'] });
      queryClient.invalidateQueries({
        queryKey: ['structure', variables.userId],
      });
    },
  });
};
