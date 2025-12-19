import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MissionInsert } from '../mission.model';

import { createMissionDirect } from '../mission.service';

export const useCreateMissionDirect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionData: MissionInsert) => {
      return createMissionDirect(missionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
};
