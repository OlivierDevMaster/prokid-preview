'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

import { updateStructureLocation } from '@/features/structures/structure.service';

import { useFindStructure } from './useFindStructure';

type Coordinates = {
  latitude: number;
  longitude: number;
};

const getGeolocation = () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      reject
    );
  });
};

export function useActivateStructureLocation() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id as string | undefined;

  const { data: structure } = useFindStructure(userId);

  const hasLocation = (() => {
    if (!structure) return false;

    const s = structure as unknown as {
      latitude?: unknown;
      location?: unknown;
      longitude?: unknown;
    };

    return s.latitude != null && s.longitude != null && s.location != null;
  })();

  const shouldShowActivateButton = !!userId && !!structure && !hasLocation;

  const [isLocating, setIsLocating] = useState(false);

  const activateMutation = useMutation({
    mutationFn: async (coords: Coordinates) => {
      if (!userId) {
        throw new Error('Missing structure user id');
      }

      return updateStructureLocation(userId, coords.latitude, coords.longitude);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structures'] });
      queryClient.invalidateQueries({
        queryKey: ['structure', userId],
      });
    },
  });

  const handleActivate = useCallback(async () => {
    if (!shouldShowActivateButton) return;

    try {
      setIsLocating(true);
      const position = await getGeolocation();
      const { latitude, longitude } = position.coords;

      await activateMutation.mutateAsync({ latitude, longitude });
    } catch {
      // Ignore geolocation errors (permission denied, timeout, etc.)
    } finally {
      setIsLocating(false);
    }
  }, [activateMutation, shouldShowActivateButton]);

  return {
    isLoading: isLocating || activateMutation.isPending,
    onActivate: handleActivate,
    shouldShowActivateButton,
  };
}
