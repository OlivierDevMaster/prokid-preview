// features/sign-up/professional/hooks/useRegisterProfessionalProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfessionalSignUpFormData } from '@/features/professional/schemas/professional-signup.schema';

import { registerProfessionalProfile } from '../professionalSignUp.service';

interface RegisterProfessionalProfileParams {
  formData: ProfessionalSignUpFormData;
  userId: string;
}

export const useRegisterProfessionalProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      userId,
    }: RegisterProfessionalProfileParams) => {
      return registerProfessionalProfile(userId, formData);
    },
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
};
