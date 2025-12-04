import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ProfessionalInsert } from '@/features/professionals/professional.model';

import { createProfessional } from '../professional.service';

export const useCreateProfessional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insertData: ProfessionalInsert) => {
      return await createProfessional(insertData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
};
