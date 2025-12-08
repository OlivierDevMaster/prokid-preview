import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProfessional } from '../professional.service';

export const useDeleteProfessional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return deleteProfessional(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
};
