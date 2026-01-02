import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateStructureInvitationRequestBody } from '../structureInvitation.model';

import { createStructureInvitation } from '../structureInvitation.service';

export const useCreateStructureInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateStructureInvitationRequestBody) => {
      return createStructureInvitation(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-invitations'] });
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
