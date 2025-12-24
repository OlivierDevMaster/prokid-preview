import { useQuery } from '@tanstack/react-query';

import type { StructureInvitation } from '../structureInvitation.model';

import { findStructureInvitation } from '../structureInvitation.service';

export const useFindStructureInvitation = (
  invitationId: null | string | undefined
) => {
  return useQuery<null | StructureInvitation, Error>({
    enabled: !!invitationId,
    queryFn: async () => {
      if (!invitationId) {
        return null;
      }

      const invitation = await findStructureInvitation(invitationId);

      return invitation;
    },
    queryKey: ['structure-invitation', invitationId],
  });
};
