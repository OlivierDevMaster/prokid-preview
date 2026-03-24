import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { createClient } from '@/lib/supabase/client';

export async function registerProfessionalProfile(
  userId: string,
  formData: ProfessionalSignUpFormData
): Promise<void> {
  const supabase = createClient();
  const hasCoordinates =
    typeof formData.latitude === 'number' &&
    typeof formData.longitude === 'number';

  let avatarUrl: null | string = null;

  if (formData.profilePhoto) {
    try {
      avatarUrl = await uploadProfilePhoto(formData.profilePhoto, userId);
    } catch (error) {
      throw new Error(
        `Failed to upload profile photo: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      avatar_url: avatarUrl,
      first_name: formData.firstName,
      is_onboarded: true,
      last_name: formData.lastName,
    })
    .eq('user_id', userId);

  if (profileUpdateError) {
    throw new Error(`Failed to update profile: ${profileUpdateError.message}`);
  }

  const { error: professionalUpdateError } = await supabase
    .from('professionals')
    .update({
      city: formData.city,
      current_job: formData.profession,
      description: formData.description || null,
      experience_years: formData.yearsExperience
        ? parseInt(formData.yearsExperience, 10)
        : 0,
      hourly_rate: formData.hourlyRate,
      intervention_radius_km: formData.interventionZone,
      latitude: hasCoordinates ? formData.latitude : null,
      location: hasCoordinates
        ? `SRID=4326;POINT(${formData.longitude} ${formData.latitude})`
        : null,
      longitude: hasCoordinates ? formData.longitude : null,
      phone: formData.phone || null,
      postal_code: formData.postalCode || null,
      skills:
        formData.skills && formData.skills.length > 0 ? formData.skills : null,
    })
    .eq('user_id', userId);

  if (professionalUpdateError) {
    throw new Error(
      `Failed to update professional profile: ${professionalUpdateError.message}`
    );
  }
}

const PROFILE_PICTURES_BUCKET =
  process.env.NEXT_PUBLIC_PROFILE_PICTURES_BUCKET || 'profile_pictures';

export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_PICTURES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload profile photo: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROFILE_PICTURES_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}
