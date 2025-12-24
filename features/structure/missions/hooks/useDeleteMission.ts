import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteStructureMission } from '../services/mission.service';

export function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (missionId: string) => deleteStructureMission(missionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-missions'] });
      queryClient.invalidateQueries({ queryKey: ['structure-mission'] });
    },
  });
}
