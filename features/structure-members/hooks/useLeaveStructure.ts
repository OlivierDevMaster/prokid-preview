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
    },
  });
};
