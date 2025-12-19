'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ProfessionalNotificationPreferences,
  ProfessionalNotificationPreferencesUpdate,
} from '../professional-notification-preferences.model';

import {
  getProfessionalNotificationPreferences,
  updateProfessionalNotificationPreferences,
} from '../services/professional-notification-preferences.service';

export function useProfessionalNotificationPreferences(id: string | undefined) {
  return useQuery<null | ProfessionalNotificationPreferences, Error>({
    enabled: !!id,
    queryFn: async () => {
      if (!id) {
        return null;
      }

      const preferences = await getProfessionalNotificationPreferences(id);

      return preferences;
    },
    queryKey: ['professional-notification-preferences', id],
  });
}

export function useUpdateProfessionalNotificationPreferences(
  id: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      preferences: ProfessionalNotificationPreferencesUpdate
    ): Promise<ProfessionalNotificationPreferences> => {
      if (!id) {
        throw new Error('User ID is required');
      }

      return updateProfessionalNotificationPreferences(id, preferences);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: ['professional-notification-preferences', id],
        });
      }
    },
  });
}
