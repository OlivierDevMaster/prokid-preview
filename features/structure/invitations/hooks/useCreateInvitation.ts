import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type {
  CreateStructureInvitationRequestBody,
  StructureInvitation,
} from '@/features/structure-invitations/structureInvitation.model';

import { createStructureInvitation } from '@/features/structure-invitations/structureInvitation.service';

export function useCreateInvitation() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const structureId = session?.user?.id;

  return useMutation<
    StructureInvitation,
    Error,
    Omit<CreateStructureInvitationRequestBody, 'structure_id'>
  >({
    mutationFn: async data => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }

      return createStructureInvitation({
        ...data,
        structure_id: structureId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-invitations'] });
      // Invalidate dashboard queries for structure
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'invitations'],
      });
    },
  });
}
