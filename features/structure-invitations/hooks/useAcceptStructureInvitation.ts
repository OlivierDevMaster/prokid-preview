import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acceptStructureInvitation } from '../structureInvitation.service';

export const useAcceptStructureInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      return acceptStructureInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['structure-invitation'] });
      queryClient.invalidateQueries({ queryKey: ['structure-members'] });
    },
  });
};
