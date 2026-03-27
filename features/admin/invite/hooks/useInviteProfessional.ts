'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  inviteProfessional,
  InviteProfessionalData,
} from '../invite.service';

export function useInviteProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteProfessionalData) => inviteProfessional(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invited-professionals'] });
    },
  });
}
