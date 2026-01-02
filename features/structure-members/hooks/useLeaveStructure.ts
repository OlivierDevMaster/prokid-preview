import { useMutation, useQueryClient } from '@tanstack/react-query';

import { leaveStructure } from '../structureMember.service';

export const useLeaveStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membershipId: string) => {
      return leaveStructure(membershipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-members'] });
      // Invalidate dashboard queries for structure
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'members'],
      });
      // Invalidate dashboard queries for professional (structures count changes)
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'professional', 'structures'],
      });
    },
  });
};
