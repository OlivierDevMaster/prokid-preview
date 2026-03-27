import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';

// Type definition based on the schema structure
export type ProfessionalSignUpFormData = {
  city: string;
  description?: string;
  firstName: string;
  interventionZone: number;
  lastName: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  postalCode?: string;
  profession: string;
  profilePhoto: File | null;
  skills?: string[];
  yearsExperience?: string;
};

export function useProfessionalSignUpSchema() {
  const t = useTranslations('auth.signUp.professionalForm');

  return useMemo(() => {
    return z.object({
      city: z.string().min(1, t('validation.cityRequired')),
      description: z.string().optional(),
      firstName: z.string().min(1, t('validation.firstNameRequired')),
      interventionZone: z
        .number()
        .min(5, t('validation.interventionZoneMin'))
        .max(100, t('validation.interventionZoneMax')),
      lastName: z.string().min(1, t('validation.lastNameRequired')),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      phone: z.string().min(1, t('validation.phoneRequired')),
      postalCode: z.string().optional(),
      profession: z.string().min(1, t('validation.professionRequired')),
      profilePhoto: z.instanceof(File).nullable().optional(),
      skills: z
        .array(z.string().min(1))
        .max(5, t('validation.skillsMax') || 'Maximum 5 skills allowed')
        .optional(),
      yearsExperience: z.string().optional(),
    });
  }, [t]);
}
