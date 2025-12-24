import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ProfessionalUpdate } from '@/features/professionals/professional.model';

import { updateProfessional } from '../professional.service';

export const useUpdateProfessional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      professionalId,
      updateData,
    }: {
      professionalId: string;
      updateData: ProfessionalUpdate;
    }) => {
      return updateProfessional(professionalId, updateData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      queryClient.invalidateQueries({
        queryKey: ['professional', variables.professionalId],
      });
    },
  });
};
