import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateMissionsRequestBody, Mission } from '../mission.model';

import { createMissions } from '../mission.service';

export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateMissionsRequestBody): Promise<Mission> => {
      const missions = await createMissions(body);
      return missions[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      // Invalidate dashboard queries for structure (missions created by structure)
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'missions'],
      });
      // Invalidate admin dashboard queries
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'admin', 'missions'],
      });
    },
  });
};
