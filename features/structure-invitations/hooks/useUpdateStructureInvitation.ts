import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { StructureInvitationUpdate } from '../structureInvitation.model';

import { updateStructureInvitation } from '../structureInvitation.service';

export const useUpdateStructureInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
      updateData,
    }: {
      invitationId: string;
      updateData: StructureInvitationUpdate;
    }) => {
      return updateStructureInvitation(invitationId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['structure-invitation'] });
    },
  });
};
