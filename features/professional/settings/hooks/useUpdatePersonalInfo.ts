'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePersonalInfo } from '../services/settings.service';

type UpdatePersonalInfoParams = {
  firstName: string;
  lastName: string;
  phone: null | string;
  userId: string;
};

export function useUpdatePersonalInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdatePersonalInfoParams) =>
      updatePersonalInfo(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional'] });
    },
  });
}
