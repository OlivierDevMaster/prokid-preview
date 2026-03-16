import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { findProfessional } from '../../_shared/features/professionals/index.ts';
import { ProfessionalOnboardingRequestBodySchema } from '../../_shared/features/professionals/professional.schemas.ts';
import { updateProfessional } from '../../_shared/features/professionals/professional.service.ts';
import { isProfileProfessional } from '../../_shared/features/profiles/index.ts';
import {
  findProfile,
  updateProfile,
} from '../../_shared/features/profiles/index.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const onBoardingProfessionalHandler = factory.createHandlers(
  async ({ get, req }) => {
    console.log('onBoardingProfessionalHandler');
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

      // Ensure a professional placeholder exists, and prevent re-onboarding
      if (!professional) {
        return apiResponse.unauthorized();
      }

      if (profile.is_onboarded) {
        return apiResponse.unauthorized();
      }

      const validationResult = await validateRequestBody(
        ProfessionalOnboardingRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      await updateProfile(supabaseClient, user.id, {
        is_onboarded: true,
      });

      const updatedProfessional = await updateProfessional(
        supabaseClient,
        user.id,
        {
          city: validationResult.data.city,
          current_job: validationResult.data.currentJob,
          description: validationResult.data.description,
          experience_years: validationResult.data.experienceYears,
          hourly_rate: validationResult.data.hourlyRate,
          intervention_radius_km: validationResult.data.interventionRadiusKm,
          phone: validationResult.data.phone,
          postal_code: validationResult.data.postalCode,
          skills: validationResult.data.skills,
        }
      );

      return apiResponse.ok(updatedProfessional);
    } catch (error) {
      console.error(error);
      return apiResponse.internalServerError();
    }
  }
);
