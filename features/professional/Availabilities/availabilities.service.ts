import { differenceInDays, format } from 'date-fns';
import { parseISO } from 'date-fns';

import type { AvailabilitySlot } from '@/features/availabilities/availability.model';

import { createClient } from '@/lib/supabase/client';

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface SaveWeekAvailabilitiesParams {
  schedule: Record<string, DaySchedule>;
  userId: string;
  weekDays: Date[];
}

interface TimeSlot {
  end: string;
  isDeleted?: boolean;
  start: string;
}

export async function deleteAvailabilityBySlot(
  slot: AvailabilitySlot,
  userId: string
): Promise<void> {
  const supabase = createClient();

  // Parse the slot start date and time
  const slotStartDate = parseISO(slot.startAt);

  // First, check if this slot is from a recurring availability
  // Find recurring availabilities that match this slot
  const { data: recurringAvailabilities, error: recurringError } =
    await supabase
      .from('availabilities')
      .select('id, rrule, duration_mn')
      .eq('user_id', userId)
      .eq('duration_mn', slot.durationMn)
      .like('rrule', '%FREQ=WEEKLY%');

  if (recurringError) {
    throw new Error(
      `Failed to find recurring availabilities: ${recurringError.message}`
    );
  }

  // Check if this slot matches a recurring availability
  const slotDayOfWeek = slotStartDate.getDay();
  const dayMap: Record<string, number> = {
    FR: 5,
    MO: 1,
    SA: 6,
    SU: 0,
    TH: 4,
    TU: 2,
    WE: 3,
  };

  let matchingRecurring = null;
  if (recurringAvailabilities && recurringAvailabilities.length > 0) {
    for (const availability of recurringAvailabilities) {
      const bydayMatch = availability.rrule.match(/BYDAY=([A-Z]{2})/);
      if (!bydayMatch) continue;

      const rruleDay = bydayMatch[1];
      if (dayMap[rruleDay] !== slotDayOfWeek) continue;

      const dtstartMatch = availability.rrule.match(
        /DTSTART:(\d{8})T(\d{2})(\d{2})/
      );
      if (!dtstartMatch) continue;

      const rruleHour = parseInt(dtstartMatch[2], 10);
      const rruleMinute = parseInt(dtstartMatch[3], 10);
      const rruleStartMinutes = rruleHour * 60 + rruleMinute;
      const slotStartMinutes =
        slotStartDate.getHours() * 60 + slotStartDate.getMinutes();

      const timeDiff = Math.abs(slotStartMinutes - rruleStartMinutes);
      if (timeDiff <= 15) {
        matchingRecurring = availability;
        break;
      }
    }
  }

  // If it's a recurring availability, add EXDATE instead of deleting
  if (matchingRecurring) {
    await addExdateForDay(
      supabase,
      matchingRecurring.id,
      slotStartDate,
      matchingRecurring.rrule
    );
    return;
  }

  // For one-time availabilities, delete them
  // Create a time window (1 minute before and after) to account for potential timezone/rounding issues
  const slotStartMinus1Min = new Date(slotStartDate.getTime() - 60 * 1000);
  const slotStartPlus1Min = new Date(slotStartDate.getTime() + 60 * 1000);

  // Find availabilities that match this slot
  // For one-time availabilities, we match by dtstart (within 1 minute window), duration, and user
  const { data: availabilities, error: findError } = await supabase
    .from('availabilities')
    .select('id, dtstart, duration_mn, rrule')
    .eq('user_id', userId)
    .eq('duration_mn', slot.durationMn)
    .gte('dtstart', slotStartMinus1Min.toISOString())
    .lte('dtstart', slotStartPlus1Min.toISOString());

  if (findError) {
    throw new Error(
      `Failed to find availability for slot: ${findError.message}`
    );
  }

  if (!availabilities || availabilities.length === 0) {
    throw new Error('No availability found for this slot');
  }

  // Filter to find exact matches (one-time only, not recurring)
  const exactMatches = availabilities.filter(av => {
    // Skip recurring availabilities (they should be handled above)
    if (av.rrule && av.rrule.includes('FREQ=WEEKLY')) return false;

    if (!av.dtstart) return false;
    const avDtstart = parseISO(av.dtstart);
    const timeDiff = Math.abs(avDtstart.getTime() - slotStartDate.getTime());
    return timeDiff <= 60 * 1000; // Within 1 minute
  });

  if (exactMatches.length === 0) {
    throw new Error('No exact availability match found for this slot');
  }

  // Delete all matching one-time availabilities
  const availabilityIds = exactMatches.map(a => a.id);

  const { error: deleteError } = await supabase
    .from('availabilities')
    .delete()
    .in('id', availabilityIds);

  if (deleteError) {
    throw new Error(`Failed to delete availability: ${deleteError.message}`);
  }
}

export async function saveWeekAvailabilities({
  schedule,
  userId,
  weekDays,
}: SaveWeekAvailabilitiesParams): Promise<void> {
  const supabase = createClient();

  // Get all recurring availabilities for this user
  const { data: recurringAvailabilities, error: recurringError } =
    await supabase
      .from('availabilities')
      .select('id, rrule, duration_mn')
      .eq('user_id', userId)
      .like('rrule', '%FREQ=WEEKLY%');

  if (recurringError) {
    throw new Error(
      `Failed to fetch recurring availabilities: ${recurringError.message}`
    );
  }

  const DAY_NAMES = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  const dayMap: Record<string, number> = {
    FR: 5,
    MO: 1,
    SA: 6,
    SU: 0,
    TH: 4,
    TU: 2,
    WE: 3,
  };

  // Process each day of the week
  for (let i = 0; i < DAY_NAMES.length; i++) {
    const dayKey = DAY_NAMES[i];
    const daySchedule = schedule[dayKey];
    const targetDate = weekDays[i];
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find recurring availabilities that apply to this day
    const recurringForDay =
      recurringAvailabilities?.filter(availability => {
        const bydayMatch = availability.rrule.match(/BYDAY=([A-Z]{2})/);
        if (!bydayMatch) return false;
        const rruleDay = bydayMatch[1];
        return dayMap[rruleDay] === dayOfWeek;
      }) || [];

    // Filter out deleted slots to check if day should be considered disabled
    const activeSlotsCount = daySchedule.slots.filter(
      slot => !slot.isDeleted
    ).length;

    if (!daySchedule.enabled || activeSlotsCount === 0) {
      // Day is disabled: exclude all recurring availabilities for this day
      for (const recurring of recurringForDay) {
        await addExdateForDay(
          supabase,
          recurring.id,
          targetDate,
          recurring.rrule
        );
      }
      continue;
    }

    // Day is enabled: process slots
    // Filter out deleted slots
    const activeSlots = daySchedule.slots.filter(slot => !slot.isDeleted);
    const newSlots = activeSlots.map(slot => ({
      durationMn: calculateDurationMinutes(slot.start, slot.end),
      start: slot.start,
      startMinutes: parseTimeToMinutes(slot.start),
    }));

    // For each recurring availability, check if it should be excluded
    const recurringToExclude: string[] = [];
    for (const recurring of recurringForDay) {
      // Extract hour and minute from DTSTART
      const dtstartMatch = recurring.rrule.match(
        /DTSTART:(\d{8})T(\d{2})(\d{2})/
      );
      if (!dtstartMatch) continue;

      const rruleHour = parseInt(dtstartMatch[2], 10);
      const rruleMinute = parseInt(dtstartMatch[3], 10);
      const rruleStartMinutes = rruleHour * 60 + rruleMinute;
      const rruleDuration = recurring.duration_mn;

      // Check if this recurring slot exists in the new schedule
      // Match by start time (within 15 minutes tolerance) and duration
      const matchingSlot = newSlots.find(slot => {
        const timeDiff = Math.abs(slot.startMinutes - rruleStartMinutes);
        return timeDiff <= 15 && slot.durationMn === rruleDuration;
      });

      if (!matchingSlot) {
        // Recurring slot is not in new schedule: exclude it for this date
        recurringToExclude.push(recurring.id);
        await addExdateForDay(
          supabase,
          recurring.id,
          targetDate,
          recurring.rrule
        );
      }
    }

    // Create one-time availabilities for slots that don't match existing recurrences
    // Only process active (non-deleted) slots
    const dayOffset = getDayOffsetFromToday(targetDate);
    for (const slot of activeSlots) {
      const startMinutes = parseTimeToMinutes(slot.start);
      const durationMinutes = calculateDurationMinutes(slot.start, slot.end);

      // Check if this slot matches a recurring availability that wasn't excluded
      const matchesRecurring = recurringForDay.some(recurring => {
        if (recurringToExclude.includes(recurring.id)) return false;

        const dtstartMatch = recurring.rrule.match(
          /DTSTART:(\d{8})T(\d{2})(\d{2})/
        );
        if (!dtstartMatch) return false;

        const rruleHour = parseInt(dtstartMatch[2], 10);
        const rruleMinute = parseInt(dtstartMatch[3], 10);
        const rruleStartMinutes = rruleHour * 60 + rruleMinute;
        const rruleDuration = recurring.duration_mn;

        const timeDiff = Math.abs(startMinutes - rruleStartMinutes);
        return timeDiff <= 15 && durationMinutes === rruleDuration;
      });

      // Only create one-time availability if it doesn't match an existing recurrence
      if (!matchesRecurring) {
        const hour = parseTimeToHour(slot.start);
        const { error } = await supabase.rpc('create_onetime_availability', {
          day_offset: dayOffset,
          duration_minutes: durationMinutes,
          hour,
          user_id_param: userId,
        });

        if (error) {
          throw new Error(
            `Failed to create availability for ${dayKey}: ${error.message}`
          );
        }
      }
    }
  }
}

/**
 * Stop recurrence for a specific slot by adding EXDATE to the recurring availability
 */
export async function stopRecurrenceForSlot(
  slot: AvailabilitySlot,
  userId: string
): Promise<void> {
  const supabase = createClient();

  // Parse the slot start date and time
  const slotStartDate = parseISO(slot.startAt);

  // Find recurring availabilities that match this slot
  // Recurring availabilities have FREQ=WEEKLY in their RRULE
  const { data: recurringAvailabilities, error: findError } = await supabase
    .from('availabilities')
    .select('id, rrule, dtstart, duration_mn')
    .eq('user_id', userId)
    .eq('duration_mn', slot.durationMn)
    .like('rrule', '%FREQ=WEEKLY%');

  if (findError) {
    throw new Error(
      `Failed to find recurring availability: ${findError.message}`
    );
  }

  if (!recurringAvailabilities || recurringAvailabilities.length === 0) {
    throw new Error('No recurring availability found for this slot');
  }

  // Find the recurring availability that matches this slot's day and time
  const slotDayOfWeek = slotStartDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayMap: Record<string, number> = {
    FR: 5,
    MO: 1,
    SA: 6,
    SU: 0,
    TH: 4,
    TU: 2,
    WE: 3,
  };

  // Find matching recurring availability
  let matchingAvailability = null;
  for (const availability of recurringAvailabilities) {
    // Parse RRULE to get BYDAY
    const bydayMatch = availability.rrule.match(/BYDAY=([A-Z]{2})/);
    if (!bydayMatch) continue;

    const rruleDay = bydayMatch[1];
    if (dayMap[rruleDay] !== slotDayOfWeek) continue;

    // Extract hour from DTSTART
    const dtstartMatch = availability.rrule.match(
      /DTSTART:(\d{8})T(\d{2})(\d{2})/
    );
    if (!dtstartMatch) continue;

    const rruleHour = parseInt(dtstartMatch[2], 10);
    const rruleMinute = parseInt(dtstartMatch[3], 10);
    const rruleStartMinutes = rruleHour * 60 + rruleMinute;
    const slotStartMinutes =
      slotStartDate.getHours() * 60 + slotStartDate.getMinutes();

    // Check if time matches (within 15 minutes tolerance)
    const timeDiff = Math.abs(slotStartMinutes - rruleStartMinutes);
    if (timeDiff <= 15) {
      matchingAvailability = availability;
      break;
    }
  }

  if (!matchingAvailability) {
    throw new Error('No matching recurring availability found for this slot');
  }

  // Check if this date is already excluded
  const exdateMatch = matchingAvailability.rrule.match(/EXDATE:([^\n]+)/);
  if (exdateMatch) {
    const exdates = exdateMatch[1].split(',');
    const dateStr =
      slotStartDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const isAlreadyExcluded = exdates.some(exdate =>
      exdate.includes(dateStr.substring(0, 8))
    );
    if (isAlreadyExcluded) {
      throw new Error('This date is already excluded from the recurrence');
    }
  }

  // Add EXDATE using RPC function
  // Note: TypeScript types may not include this function yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: exdateError } = await (supabase.rpc as any)(
    'add_exdate_to_recurring_availability',
    {
      availability_id_param: matchingAvailability.id,
      date_to_exclude: slotStartDate.toISOString(),
    }
  );

  if (exdateError) {
    throw new Error(`Failed to stop recurrence: ${exdateError.message}`);
  }
}

/**
 * Add EXDATE for a specific day to a recurring availability
 */
async function addExdateForDay(
  supabase: ReturnType<typeof createClient>,
  availabilityId: string,
  date: Date,
  rrule: string
): Promise<void> {
  // Extract hour from DTSTART
  const dtstartMatch = rrule.match(/DTSTART:(\d{8})T(\d{2})(\d{2})/);
  if (!dtstartMatch) return;

  const hour = parseInt(dtstartMatch[2], 10);
  const minute = parseInt(dtstartMatch[3], 10);

  // Create date with the same hour as the recurring availability
  const dateToExclude = new Date(date);
  dateToExclude.setHours(hour, minute, 0, 0);

  // Check if this date is already excluded
  const exdateMatch = rrule.match(/EXDATE:([^\n]+)/);
  if (exdateMatch) {
    const exdates = exdateMatch[1].split(',');
    const dateStr = format(dateToExclude, 'yyyyMMdd');
    const hourStr = format(dateToExclude, 'HHmm');
    const isAlreadyExcluded = exdates.some(
      exdate => exdate.includes(dateStr) && exdate.includes(hourStr)
    );
    if (isAlreadyExcluded) {
      return; // Already excluded
    }
  }

  // Add EXDATE using RPC function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: exdateError } = await (supabase.rpc as any)(
    'add_exdate_to_recurring_availability',
    {
      availability_id_param: availabilityId,
      date_to_exclude: dateToExclude.toISOString(),
    }
  );

  if (exdateError) {
    console.error(
      `Error adding EXDATE to availability ${availabilityId}:`,
      exdateError
    );
    // Don't throw - continue with other availabilities
  }
}

function calculateDurationMinutes(start: string, end: string): number {
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return endTotalMinutes - startTotalMinutes;
}

function getDayOffsetFromToday(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  return differenceInDays(target, today);
}

function parseTimeToHour(time: string): number {
  const [hours] = time.split(':');
  return parseInt(hours, 10);
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}
