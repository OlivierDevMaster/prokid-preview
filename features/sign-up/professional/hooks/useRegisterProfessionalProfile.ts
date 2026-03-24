// features/sign-up/professional/hooks/useRegisterProfessionalProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { useRouter } from '@/i18n/routing';

import { registerProfessionalProfile } from '../professionalSignUp.service';

interface RegisterProfessionalProfileParams {
  formData: ProfessionalSignUpFormData;
  userId: string;
}

export const useRegisterProfessionalProfile = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('auth.signUp.professionalForm');

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
        error instanceof Error ? error.message : t('failedToUpdateProfile')
      );
    },
    onSuccess: async () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });

      // Wait for the profile query to refetch before redirecting
      // This ensures the layout component sees the updated isOnboarded status
      // Refetch all user-profile queries (they use pattern ['user-profile', userId])
      await queryClient.refetchQueries({
        exact: false,
        queryKey: ['user-profile'],
      });

      toast.success(t('profileUpdatedSuccessfully'));
      router.push('/professional/dashboard');
    },
  });
};
