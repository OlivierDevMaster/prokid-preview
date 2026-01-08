import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteStructureInvitation } from '../structureInvitation.service';

export const useDeleteStructureInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      return deleteStructureInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['structure-invitation'] });
      queryClient.invalidateQueries({
        queryKey: ['structure-invitations-with-structure'],
      });
      queryClient.invalidateQueries({
        queryKey: ['structure-invitations-with-professional'],
      });
      queryClient.invalidateQueries({ queryKey: ['structure-members'] });
      // Invalidate dashboard queries for structure
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'invitations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'members'],
      });
      // Invalidate admin dashboard queries
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'invitations'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'professionals'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'structures'],
      });
    },
  });
};
