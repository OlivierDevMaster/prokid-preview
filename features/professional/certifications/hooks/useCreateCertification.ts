import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfessionalCertificationInsert } from '../certification.model';

import { createCertification } from '../certification.service';

export const useCreateCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (certification: ProfessionalCertificationInsert) => {
      return createCertification(certification);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-certifications'] });
    },
  });
};
