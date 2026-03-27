import { useMutation, useQueryClient } from '@tanstack/react-query';

import { declineMission } from '../mission.service';

export const useDeclineMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      return declineMission(missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission'] });
      queryClient.invalidateQueries({ queryKey: ['professional-missions'] });
      queryClient.invalidateQueries({ queryKey: ['structure-missions'] });
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
