import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteExperience } from '../experience.service';

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experienceId: string) => {
      return deleteExperience(experienceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-experiences'] });
    },
  });
};
