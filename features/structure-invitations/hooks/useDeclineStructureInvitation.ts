import { useMutation, useQueryClient } from '@tanstack/react-query';

import { declineStructureInvitation } from '../structureInvitation.service';

export const useDeclineStructureInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      return declineStructureInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['structure-invitation'] });
      queryClient.invalidateQueries({ queryKey: ['structure-members'] });
      // Invalidate dashboard queries for structure
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'invitations'],
      });
      // Invalidate admin dashboard queries
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'invitations'],
      });
    },
  });
};
