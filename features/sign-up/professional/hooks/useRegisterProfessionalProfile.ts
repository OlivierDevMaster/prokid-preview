// features/sign-up/professional/hooks/useRegisterProfessionalProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { ProfessionalSignUpFormData } from '@/features/professional/schemas/professional-signup.schema';

import { useRouter } from '@/i18n/routing';

import { registerProfessionalProfile } from '../professionalSignUp.service';

interface RegisterProfessionalProfileParams {
  formData: ProfessionalSignUpFormData;
  userId: string;
}

export const useRegisterProfessionalProfile = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      formData,
      userId,
    }: RegisterProfessionalProfileParams) => {
      return registerProfessionalProfile(userId, formData);
    },
    onError: error => {
      console.error('Error registering professional profile:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create professional profile. Please try again.'
      );
    },
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
      toast.success('Profile created successfully');
      router.push('/professional/dashboard');
    },
  });
};
