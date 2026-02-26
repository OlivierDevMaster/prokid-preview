'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import {
  findProfessional,
  updateProfessional,
} from '@/features/professionals/professional.service';

export function useProfessionalAvailability() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // Fetch current professional availability status
  const {
    data: professional,
    error,
    isLoading,
  } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      return await findProfessional(userId);
    },
    queryKey: ['professional', userId],
  });

  // Mutation to update availability status
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return await updateProfessional(userId, { is_available: isAvailable });
    },
    onSuccess: () => {
      // Invalidate and refetch professional data
      queryClient.invalidateQueries({ queryKey: ['professional', userId] });
    },
  });

  return {
    error,
    isAvailable: professional?.is_available ?? false,
    isLoading,
    isUpdating: updateAvailabilityMutation.isPending,
    updateAvailability: updateAvailabilityMutation.mutate,
    updateAvailabilityAsync: updateAvailabilityMutation.mutateAsync,
  };
}
