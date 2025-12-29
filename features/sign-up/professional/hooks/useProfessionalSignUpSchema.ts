import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';

import type { DaySchedule } from '@/features/sign-up/professional/components/steps/Step3Availability';

const timeSlotSchema = z.object({
  end: z.string(),
  start: z.string(),
});

const dayScheduleSchema: z.ZodType<DaySchedule> = z.object({
  enabled: z.boolean(),
  recurring: z.boolean(),
  slots: z.array(timeSlotSchema),
});

// Type definition based on the schema structure
export type ProfessionalSignUpFormData = {
  availabilities: Record<string, DaySchedule>;
  city: string;
  description?: string;
  firstName: string;
  hourlyRate: number;
  interventionZone: number;
  lastName: string;
  phone: string;
  postalCode?: string;
  profession: string;
  profilePhoto: File | null;
  yearsExperience?: string;
};

export function useProfessionalSignUpSchema() {
  const t = useTranslations('auth.signUp.professionalForm');

  return useMemo(() => {
    return z.object({
      availabilities: z.record(z.string(), dayScheduleSchema),
      city: z.string().min(1, t('validation.cityRequired')),
      description: z.string().optional(),
      firstName: z.string().min(1, t('validation.firstNameRequired')),
      hourlyRate: z.preprocess(
        val => {
          if (val === '' || val === null || val === undefined) {
            return undefined;
          }
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        },
        z
          .number({
            message: t('validation.hourlyRateRequired'),
          })
          .min(1, t('validation.hourlyRateMin'))
      ),
      interventionZone: z
        .number()
        .min(5, t('validation.interventionZoneMin'))
        .max(100, t('validation.interventionZoneMax')),
      lastName: z.string().min(1, t('validation.lastNameRequired')),
      phone: z.string().min(1, t('validation.phoneRequired')),
      postalCode: z.string().optional(),
      profession: z.string().min(1, t('validation.professionRequired')),
      profilePhoto: z.instanceof(File).nullable().optional(),
      yearsExperience: z.string().optional(),
    });
  }, [t]);
}
