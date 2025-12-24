'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfileUpdate } from '../profile.model';

import { updateProfile } from '../profile.service';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      updateData,
      userId,
    }: {
      updateData: ProfileUpdate;
      userId: string;
    }) => {
      return updateProfile(userId, updateData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['profile', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['professional', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['structure', variables.userId],
      });
    },
  });
};
