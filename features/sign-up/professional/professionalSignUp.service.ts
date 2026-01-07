import { RRule } from 'rrule';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

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
      is_onboarded: true,
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
      hourly_rate: formData.hourlyRate,
      intervention_radius_km: formData.interventionZone,
      phone: formData.phone || null,
      postal_code: formData.postalCode || null,
      skills:
        formData.skills && formData.skills.length > 0 ? formData.skills : null,
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
        if (daySchedule.recurring) {
          await createAvailabilityRrule(userId, dayName as DayName, slot);
        } else {
          await createOnetimeAvailability(userId, dayName as DayName, slot);
        }
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
  const daysUntil = getDaysUntilNextDayOfWeek(targetDow);
  const durationMinutes = calculateDurationMinutes(slot.start, slot.end);

  // Calculate the target date
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntil);

  // Create Date object with local time
  const slotDate = new Date(targetDate);
  const [slotHours, slotMinutes] = slot.start.split(':').map(Number);
  slotDate.setHours(slotHours, slotMinutes, 0, 0);

  // Map day abbreviations to RRule constants
  const rruleDayMap: Record<DayName, number> = {
    friday: RRule.FR as unknown as number,
    monday: RRule.MO as unknown as number,
    saturday: RRule.SA as unknown as number,
    sunday: RRule.SU as unknown as number,
    thursday: RRule.TH as unknown as number,
    tuesday: RRule.TU as unknown as number,
    wednesday: RRule.WE as unknown as number,
  };

  const rruleDay = rruleDayMap[dayName];
  if (rruleDay === undefined) {
    throw new Error(`Invalid day name: ${dayName}`);
  }

  // Create recurring rrule using RRule library
  const newRule = new RRule({
    byweekday: [rruleDay],
    dtstart: slotDate,
    freq: RRule.WEEKLY,
  });

  const rruleString = newRule.toString();

  // Insert directly into database
  const { error } = await supabase.from('availabilities').insert({
    duration_mn: durationMinutes,
    rrule: rruleString,
    user_id: userId,
  });

  if (error) {
    throw new Error(
      `Failed to create recurring availability for ${dayName}: ${error.message}`
    );
  }
}

async function createOnetimeAvailability(
  userId: string,
  dayName: DayName,
  slot: { end: string; start: string }
): Promise<void> {
  const supabase = createClient();
  const targetDow = DAY_NAME_TO_DOW[dayName];
  const daysUntil = getDaysUntilNextDayOfWeek(targetDow);
  const durationMinutes = calculateDurationMinutes(slot.start, slot.end);

  // Calculate the target date
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntil);

  // Create Date object with local time
  const slotDate = new Date(targetDate);
  const [slotHours, slotMinutes] = slot.start.split(':').map(Number);
  slotDate.setHours(slotHours, slotMinutes, 0, 0);

  // Create one-time rrule using RRule library (DAILY with COUNT=1)
  const newRule = new RRule({
    count: 1,
    dtstart: slotDate,
    freq: RRule.DAILY,
  });

  const rruleString = newRule.toString();

  // Insert directly into database
  const { error } = await supabase.from('availabilities').insert({
    duration_mn: durationMinutes,
    rrule: rruleString,
    user_id: userId,
  });

  if (error) {
    throw new Error(
      `Failed to create one-time availability for ${dayName}: ${error.message}`
    );
  }
}

function getDaysUntilNextDayOfWeek(targetDow: number): number {
  const today = new Date();
  const currentDow = today.getDay();
  const daysUntil = (targetDow - currentDow + 7) % 7;
  return daysUntil === 0 ? 7 : daysUntil;
}
