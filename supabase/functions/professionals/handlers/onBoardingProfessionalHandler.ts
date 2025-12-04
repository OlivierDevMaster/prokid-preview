import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { findProfessional } from '../../_shared/features/professionals/index.ts';
import { ProfessionalOnboardingRequestBodySchema } from '../../_shared/features/professionals/professional.schemas.ts';
import { createProfessional } from '../../_shared/features/professionals/professional.service.ts';
import { isProfileProfessional } from '../../_shared/features/profiles/index.ts';
import {
  findProfile,
  updateProfile,
} from '../../_shared/features/profiles/index.ts';
import { validateRequest } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const onBoardingProfessionalHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const user = get('user');
      const supabaseClient = get('supabaseClient');

      // find profile
      const profile = await findProfile(supabaseClient, user.id);

      if (!profile) {
        return apiResponse.unauthorized();
      }

      // Check if professional is a professional
      if (!isProfileProfessional(profile)) {
        return apiResponse.unauthorized();
      }

      const professional = await findProfessional(supabaseClient, user.id);

      // Check if professional exists, it means he is already onboarded
      if (professional) {
        return apiResponse.unauthorized();
      }

      const validationResult = await validateRequest(
        ProfessionalOnboardingRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      await updateProfile(supabaseClient, user.id, {
        is_onboarded: true,
      });

      const updatedProfessional = await createProfessional(supabaseClient, {
        city: validationResult.data.city,
        description: validationResult.data.description,
        experience_years: validationResult.data.experienceYears,
        hourly_rate: validationResult.data.hourlyRate,
        intervention_radius_km: validationResult.data.interventionRadiusKm,
        phone: validationResult.data.phone,
        postal_code: validationResult.data.postalCode,
        professional_email: profile.email,
        skills: validationResult.data.skills,
        user_id: user.id,
      });

      return apiResponse.ok(updatedProfessional);
    } catch {
      return apiResponse.internalServerError();
    }
  }
);
