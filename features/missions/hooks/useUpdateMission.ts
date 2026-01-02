import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { MissionUpdate } from '../mission.model';

import { updateMission } from '../mission.service';

export const useUpdateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      updateData,
    }: {
      missionId: string;
      updateData: MissionUpdate;
    }) => {
      return updateMission(missionId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission'] });
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      // Invalidate dashboard queries for both professional and structure
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'professional', 'missions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'structure', 'missions'],
      });
    },
  });
};
