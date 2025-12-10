// features/sign-up/professional/hooks/useRegisterProfessionalProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfessionalSignUpFormData } from '@/features/professional/schemas/professional-signup.schema';

import { registerProfessionalProfile } from '../professionalSignUp.service';

export const useRegisterProfessionalProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ProfessionalSignUpFormData) => {
      console.info('mutation fn called');
      return registerProfessionalProfile(formData);
    },
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
};
