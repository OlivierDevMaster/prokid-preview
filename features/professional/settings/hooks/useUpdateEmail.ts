'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateEmail } from '../services/settings.service';

type UpdateEmailParams = {
  email: string;
  emailRedirectTo?: string;
};

export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, emailRedirectTo }: UpdateEmailParams) =>
      updateEmail(email, emailRedirectTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
