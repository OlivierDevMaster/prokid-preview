import { z } from 'zod';

export const ProfessionalOnboardingRequestBodySchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  description: z.string().min(1).nullable(),
  experienceYears: z.number().min(0),
  hourlyRate: z.number().min(0),
  interventionRadiusKm: z.number().min(0),
  phone: z.string().min(1).nullable(),
  postalCode: z.string().min(1),
  skills: z.array(z.string()).min(1),
});

export type ProfessionalOnboardingRequestBody = z.infer<
  typeof ProfessionalOnboardingRequestBodySchema
>;
