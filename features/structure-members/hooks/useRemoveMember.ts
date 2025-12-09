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
    },
  });
};
