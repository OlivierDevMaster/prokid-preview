import type { ProfessionalSignUpFormData } from '@/features/professional/schemas/professional-signup.schema';

import { createClient } from '@/lib/supabase/client';

type DayName =
  | 'friday'
  | 'monday'
  | 'saturday'
  | 'sunday'
  | 'thursday'
  | 'tuesday'
  | 'wednesday';

const DAY_NAME_TO_DOW: Record<DayName, number> = {
  friday: 5,
  monday: 1,
  saturday: 6,
  sunday: 0,
  thursday: 4,
  tuesday: 2,
  wednesday: 3,
};

export async function registerProfessionalProfile(
  userId: string,
  formData: ProfessionalSignUpFormData
): Promise<void> {
  const supabase = createClient();

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
      last_name: formData.lastName,
    })
    .eq('user_id', userId);

  if (profileUpdateError) {
    throw new Error(`Failed to update profile: ${profileUpdateError.message}`);
  }

  const { error: professionalInsertError } = await supabase
    .from('professionals')
    .insert({
      city: formData.city,
      current_job: formData.profession,
      description: formData.description || null,
      experience_years: formData.yearsExperience
        ? parseInt(formData.yearsExperience, 10)
        : 0,
      hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
      intervention_radius_km: formData.interventionZone,
      phone: formData.phone || null,
      postal_code: formData.postalCode || null,
      user_id: userId,
    });

  if (professionalInsertError) {
    throw new Error(
      `Failed to create professional profile: ${professionalInsertError.message}`
    );
  }

  for (const [dayName, daySchedule] of Object.entries(
    formData.availabilities
  )) {
    if (!daySchedule.enabled || daySchedule.slots.length === 0) {
      continue;
    }

    for (const slot of daySchedule.slots) {
      try {
        await createAvailabilityRrule(userId, dayName as DayName, slot);
      } catch (error) {
        console.error(`Error creating availability for ${dayName}:`, error);
        throw error;
      }
    }
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

function calculateDurationMinutes(start: string, end: string): number {
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  return endTotalMinutes - startTotalMinutes;
}

async function createAvailabilityRrule(
  userId: string,
  dayName: DayName,
  slot: { end: string; start: string }
): Promise<void> {
  const supabase = createClient();
  const targetDow = DAY_NAME_TO_DOW[dayName];
  const dayOffset = getDaysUntilNextDayOfWeek(targetDow);
  const hour = parseTimeToHour(slot.start);
  const durationMinutes = calculateDurationMinutes(slot.start, slot.end);

  const { error } = await supabase.rpc('create_recurring_availability', {
    day_offset: dayOffset,
    duration_minutes: durationMinutes,
    exdate_offsets: undefined,
    hour,
    user_id_param: userId,
  });

  if (error) {
    throw new Error(
      `Failed to create availability for ${dayName}: ${error.message}`
    );
  }
}

function getDaysUntilNextDayOfWeek(targetDow: number): number {
  const today = new Date();
  const currentDow = today.getDay();
  const daysUntil = (targetDow - currentDow + 7) % 7;
  return daysUntil === 0 ? 7 : daysUntil;
}

function parseTimeToHour(time: string): number {
  const [hours] = time.split(':');
  return parseInt(hours, 10);
}
