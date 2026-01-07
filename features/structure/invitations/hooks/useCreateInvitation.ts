import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type {
  CreateStructureInvitationRequestBody,
  StructureInvitation,
} from '@/features/structure-invitations/structureInvitation.model';

import {
  createStructureInvitation,
  createStructureInvitations,
} from '@/features/structure-invitations/structureInvitation.service';

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

export function useCreateInvitations() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const structureId = session?.user?.id;

  return useMutation<
    StructureInvitation[],
    Error,
    {
      professional_ids: string[];
    } & Omit<
      CreateStructureInvitationRequestBody,
      'professional_id' | 'structure_id'
    >
  >({
    mutationFn: async data => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }

      return createStructureInvitations({
        ...data,
        structure_id: structureId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-invitations'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'invitations'],
      });
    },
  });
}
