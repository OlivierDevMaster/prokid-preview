import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfessionalCertificationUpdate } from '../certification.model';

import { updateCertification } from '../certification.service';

export const useUpdateCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      id,
    }: {
      data: ProfessionalCertificationUpdate;
      id: string;
    }) => {
      return updateCertification(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-certifications'] });
    },
  });
};
