import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateMissionRequestBody } from '../mission.model';

import { createMission } from '../mission.service';

export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateMissionRequestBody) => {
      return createMission(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
    },
  });
};
