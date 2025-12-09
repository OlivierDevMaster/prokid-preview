import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteStructure } from '../structure.service';

export const useDeleteStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return deleteStructure(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['structures'] });
      queryClient.invalidateQueries({ queryKey: ['structure', userId] });
    },
  });
};
