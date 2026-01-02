import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acceptMission } from '../mission.service';

export const useAcceptMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      return acceptMission(missionId);
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
