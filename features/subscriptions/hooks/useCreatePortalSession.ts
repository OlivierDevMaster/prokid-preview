import { useMutation } from '@tanstack/react-query';

import type { CreatePortalSessionRequestBody } from '../subscription.model';

import { createPortalSession } from '../subscription.service';

export const useCreatePortalSession = () => {
  return useMutation({
    mutationFn: async (body: CreatePortalSessionRequestBody) => {
      return createPortalSession(body);
    },
  });
};
