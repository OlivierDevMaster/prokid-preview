'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, isAfter } from 'date-fns';
import { useSession } from 'next-auth/react';

import {
  findProfessional,
  updateProfessional,
} from '@/features/professionals/professional.service';

type UpdateAvailabilityPayload = {
  durationDays: null | number;
  isAvailable: boolean;
};

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

  const effectiveIsAvailable =
    !!professional?.is_available &&
    (!professional.availability_end ||
      isAfter(new Date(professional.availability_end), new Date()));

  // Mutation to update availability status with optional duration window
  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({
      durationDays,
      isAvailable,
    }: UpdateAvailabilityPayload) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!isAvailable) {
        return await updateProfessional(userId, {
          availability_end: null,
          availability_start: null,
          is_available: false,
        });
      }

      const now = new Date();
      const availabilityStart = now.toISOString();
      const endDate = durationDays ? addDays(now, durationDays) : null;
      const availabilityEnd = endDate ? endDate.toISOString() : null;

      return await updateProfessional(userId, {
        availability_end: availabilityEnd,
        availability_start: availabilityStart,
        is_available: true,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch professional data
      queryClient.invalidateQueries({ queryKey: ['professional', userId] });
    },
  });

  return {
    error,
    isAvailable: effectiveIsAvailable,
    isLoading,
    isUpdating: updateAvailabilityMutation.isPending,
    updateAvailability: updateAvailabilityMutation.mutate,
    updateAvailabilityAsync: updateAvailabilityMutation.mutateAsync,
  };
}
