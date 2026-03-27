import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteCertification } from '../certification.service';

export const useDeleteCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (certificationId: string) => {
      return deleteCertification(certificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-certifications'] });
    },
  });
};
