'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type {
  ProfessionalNotificationPreferences,
  ProfessionalNotificationPreferencesUpdate,
} from '../professional-notification-preferences.model';

import {
  getProfessionalNotificationPreferences,
  updateProfessionalNotificationPreferences,
} from '../services/professional-notification-preferences.service';

export function useProfessionalNotificationPreferences() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery<null | ProfessionalNotificationPreferences, Error>({
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const preferences = await getProfessionalNotificationPreferences(userId);

      return preferences;
    },
    queryKey: ['professional-notification-preferences', userId],
  });
}

export function useUpdateProfessionalNotificationPreferences() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (
      preferences: ProfessionalNotificationPreferencesUpdate
    ): Promise<ProfessionalNotificationPreferences> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      return updateProfessionalNotificationPreferences(userId, preferences);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ['professional-notification-preferences', userId],
        });
      }
    },
  });
}
