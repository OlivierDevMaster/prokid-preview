import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeMemberFromStructure } from '../structureMember.service';

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membershipId: string) => {
      return removeMemberFromStructure(membershipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-members'] });
      // Invalidate dashboard queries for structure
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'members'],
      });
    },
  });
};
