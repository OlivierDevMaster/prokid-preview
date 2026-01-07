import { format } from 'date-fns';
import { parseISO } from 'date-fns';
import { RRule, RRuleSet, rrulestr } from 'rrule';

import type { AvailabilitySlot } from '@/features/availabilities/availability.model';

import { createClient } from '@/lib/supabase/client';
interface DaySchedule {
  enabled: boolean;
  recurring?: boolean;
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
  originalSlot?: AvailabilitySlot;
  recurring?: boolean;
  start: string;
}

/**
 * Delete or exclude an availability slot
 * - For recurring slots: adds EXDATE to exclude the specific date
 * - For one-time slots: deletes the availability
 */
export async function deleteAvailabilityBySlot(
  slot: AvailabilitySlot,
  userId: string,
  forceDelete: boolean = false
): Promise<void> {
  const supabase = createClient();
  const slotStartDate = parseISO(slot.startAt);

  // Use availabilityId if available (most efficient path)
  if (slot.availabilityId) {
    const { data: availability, error: fetchError } = await supabase
      .from('availabilities')
      .select('id, rrule, user_id')
      .eq('id', slot.availabilityId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !availability) {
      throw new Error(
        `Availability not found or access denied: ${fetchError?.message || 'Not found'}`
      );
    }

    // Verify it matches the slot's recurring status
    const isRecurring = availability.rrule?.includes('FREQ=WEEKLY') ?? false;

    // For recurring availabilities: add EXDATE to exclude this specific date
    // For one-time availabilities or when forceDelete is true: delete the availability
    if (isRecurring && !forceDelete) {
      // Recurring: add EXDATE to exclude this specific date
      await addExdateForDay(
        supabase,
        availability.id,
        slotStartDate,
        availability.rrule
      );
    } else {
      // One-time or forceDelete: delete the availability
      const { data: deletedData, error: deleteError } = await supabase
        .from('availabilities')
        .delete()
        .eq('id', availability.id)
        .select();

      if (deleteError) {
        console.info('Failed to delete availability', {
          availability,
          deleteError,
        });
        throw new Error(
          `Failed to delete availability: ${deleteError.message}`
        );
      }

      // Check if any rows were actually deleted (RLS might have blocked it)
      if (!deletedData || deletedData.length === 0) {
        throw new Error(
          `Failed to delete availability: No rows deleted. This may be due to RLS policy restrictions or the availability may not exist.`
        );
      }

      console.info('Successfully deleted availability', { deletedData });
    }
    return;
  }

  // Fallback: if availabilityId is not available, use the old matching logic
  // This should rarely happen, but we keep it for safety
  const { data: allAvailabilities, error: fetchError } = await supabase
    .from('availabilities')
    .select('id, rrule, duration_mn')
    .eq('user_id', userId)
    .eq('duration_mn', slot.durationMn);

  if (fetchError) {
    throw new Error(`Failed to fetch availabilities: ${fetchError.message}`);
  }

  if (!allAvailabilities || allAvailabilities.length === 0) {
    throw new Error('No availability found for this slot');
  }

  // If slot is marked as recurring, find and exclude from recurring availability
  if (slot.isRecurring) {
    const recurringAvailabilities = allAvailabilities.filter(
      av => av.rrule && av.rrule.includes('FREQ=WEEKLY')
    );

    // Find matching recurring availability by checking if slot's rrule matches
    const matchingRecurring = recurringAvailabilities.find(
      av => av.rrule === slot.rrule
    );

    if (matchingRecurring) {
      await addExdateForDay(
        supabase,
        matchingRecurring.id,
        slotStartDate,
        matchingRecurring.rrule
      );
      return;
    }
  }

  // For one-time slots, find and delete matching availability
  const oneTimeAvailabilities = allAvailabilities.filter(
    av =>
      av.rrule &&
      (av.rrule.includes('COUNT=1') || !av.rrule.includes('FREQ=WEEKLY'))
  );

  // Match by rrule if available, otherwise match by date/time
  const matchingOneTime = oneTimeAvailabilities.filter(av => {
    if (slot.rrule && av.rrule === slot.rrule) {
      return true;
    }

    // Fallback: match by date/time (within 15 minutes tolerance)
    try {
      const rule = rrulestr(av.rrule);
      const dtstart = rule.options.dtstart;
      if (dtstart) {
        const dateDiff = Math.abs(dtstart.getTime() - slotStartDate.getTime());
        return dateDiff <= 15 * 60 * 1000;
      }
    } catch {
      // If parsing fails, skip
    }
    return false;
  });

  if (matchingOneTime.length === 0) {
    throw new Error(
      'No matching availability found for this slot. It may already be deleted or excluded.'
    );
  }

  const availabilityIds = matchingOneTime.map(a => a.id);
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

  // Calculate week date range
  const weekStart = weekDays[0];
  const weekEnd = weekDays[weekDays.length - 1];
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);

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

  // Get all one-time availabilities for this user to avoid duplicates
  // One-time availabilities have COUNT=1 in their RRULE
  // Note: We don't filter by dtstart here because dtstart may be null in the database
  // We'll extract dtstart from the RRULE when comparing
  const { data: oneTimeAvailabilities, error: oneTimeError } = await supabase
    .from('availabilities')
    .select('id, rrule, duration_mn, dtstart')
    .eq('user_id', userId)
    .like('rrule', '%COUNT=1%');

  if (oneTimeError) {
    throw new Error(
      `Failed to fetch one-time availabilities: ${oneTimeError.message}`
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

    // If no active slots, skip this day (recurrences are already handled above)
    if (activeSlots.length === 0) {
      continue;
    }

    const newSlots = activeSlots.map(slot => ({
      durationMn: calculateDurationMinutes(slot.start, slot.end),
      start: slot.start,
      startMinutes: parseTimeToMinutes(slot.start),
    }));

    // For each recurring availability, check if it should be excluded
    const recurringToExclude: string[] = [];
    for (const recurring of recurringForDay) {
      try {
        // Parse RRULE to get dtstart
        const rule = rrulestr(recurring.rrule);
        const ruleDtstart = rule.options.dtstart;

        let rruleStartMinutes: number;
        if (ruleDtstart) {
          const ruleHour = ruleDtstart.getUTCHours();
          const ruleMinute = ruleDtstart.getUTCMinutes();
          rruleStartMinutes = ruleHour * 60 + ruleMinute;
        } else {
          // Fallback to regex extraction
          const dtstartMatch = recurring.rrule.match(
            /DTSTART:(\d{8})T(\d{2})(\d{2})/
          );
          if (!dtstartMatch) continue;
          const rruleHour = parseInt(dtstartMatch[2], 10);
          const rruleMinute = parseInt(dtstartMatch[3], 10);
          rruleStartMinutes = rruleHour * 60 + rruleMinute;
        }

        const rruleDuration = recurring.duration_mn;

        // Check if this recurring slot exists in the new schedule
        // Match by start time (within 15 minutes tolerance) and duration
        const matchingSlot = newSlots.find(slot => {
          const timeDiff = Math.abs(slot.startMinutes - rruleStartMinutes);
          return timeDiff <= 15 && slot.durationMn === rruleDuration;
        });

        if (!matchingSlot) {
          // Recurring slot is not in new schedule: exclude it for this date
          // But first check if it's already excluded
          let isAlreadyExcluded = false;
          if (rule instanceof RRuleSet) {
            const exdates = rule.exdates();
            const targetDateOnly = new Date(targetDate);
            targetDateOnly.setHours(0, 0, 0, 0);
            isAlreadyExcluded = exdates.some(exdate => {
              const exdateDate = new Date(exdate);
              exdateDate.setHours(0, 0, 0, 0);
              return exdateDate.getTime() === targetDateOnly.getTime();
            });
          }

          if (!isAlreadyExcluded) {
            recurringToExclude.push(recurring.id);
            await addExdateForDay(
              supabase,
              recurring.id,
              targetDate,
              recurring.rrule
            );
          }
        }
      } catch {
        // If parsing fails, skip this recurring
        continue;
      }
    }

    // Create one-time availabilities for slots that don't match existing recurrences
    // Only process active (non-deleted) slots
    for (const slot of activeSlots) {
      const startMinutes = parseTimeToMinutes(slot.start);
      const durationMinutes = calculateDurationMinutes(slot.start, slot.end);

      // Check if this slot matches a recurring availability that wasn't excluded
      // Also check if the recurring availability has this date excluded via EXDATE
      const slotDate = new Date(targetDate);
      const [slotHours, slotMinutes] = slot.start.split(':').map(Number);
      slotDate.setHours(slotHours, slotMinutes, 0, 0);

      // CRITICAL: If slot has an originalSlot with availabilityId, update existing availability instead of creating new one
      const originalSlot = slot.originalSlot;
      const availabilityId = originalSlot?.availabilityId;
      if (availabilityId) {
        // Fetch the existing availability to get its current state
        const { data: existingAvailability, error: fetchError } = await supabase
          .from('availabilities')
          .select('id, rrule, duration_mn, user_id')
          .eq('id', availabilityId)
          .eq('user_id', userId)
          .single();

        if (fetchError || !existingAvailability) {
          console.warn(
            `Availability ${availabilityId} not found or access denied, will create new one:`,
            fetchError?.message
          );
          // Fall through to normal creation logic
        } else {
          // Check if this availability is in the recurringToExclude list
          // If it is, remove it from the list since we're updating it instead
          const indexToRemove = recurringToExclude.indexOf(availabilityId);
          if (indexToRemove !== -1) {
            recurringToExclude.splice(indexToRemove, 1);
          }

          // Update the existing availability with new start time, duration, and rrule
          const slotShouldBeRecurring = slot.recurring === true;
          try {
            await updateAvailabilityForSlot(
              supabase,
              existingAvailability,
              slotDate,
              durationMinutes,
              slotShouldBeRecurring,
              dayOfWeek,
              dayMap
            );
            // Skip the rest of the loop since we've updated the existing availability
            continue;
          } catch (updateError) {
            console.error(
              `Failed to update availability ${availabilityId}:`,
              updateError
            );
            // Fall through to normal creation logic as fallback
          }
        }
      }

      // Check if this slot matches a recurring availability that wasn't excluded
      // This is critical: if it matches, we should NOT create a one-time availability
      const matchesRecurring = recurringForDay.some(recurring => {
        // Skip if this recurring was marked for exclusion
        if (recurringToExclude.includes(recurring.id)) return false;

        try {
          // Parse the RRULE to check if this date is excluded
          const rule = rrulestr(recurring.rrule);

          // Check if this date is excluded via EXDATE
          // If excluded, this slot should be created as one-time (not part of recurrence)
          let isExcluded = false;
          if (rule instanceof RRuleSet) {
            const exdates = rule.exdates();
            const slotDateOnly = new Date(slotDate);
            slotDateOnly.setHours(0, 0, 0, 0);
            isExcluded = exdates.some(exdate => {
              const exdateDate = new Date(exdate);
              exdateDate.setHours(0, 0, 0, 0);
              return exdateDate.getTime() === slotDateOnly.getTime();
            });
          } else {
            // Check EXDATE in the RRULE string if not a RRuleSet
            const exdateMatch = recurring.rrule.match(/EXDATE:([^\n]+)/);
            if (exdateMatch) {
              const exdates = exdateMatch[1].split(',');
              const slotDateStr = format(slotDate, 'yyyyMMdd');
              isExcluded = exdates.some(exdate => exdate.includes(slotDateStr));
            }
          }

          // If excluded, this slot should be created as one-time
          if (isExcluded) return false;

          // Check if time and duration match
          const ruleDtstart = rule.options.dtstart;
          if (!ruleDtstart) {
            // Try to extract from RRULE string
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
          }

          const ruleHour = ruleDtstart.getUTCHours();
          const ruleMinute = ruleDtstart.getUTCMinutes();
          const rruleStartMinutes = ruleHour * 60 + ruleMinute;
          const rruleDuration = recurring.duration_mn;

          const timeDiff = Math.abs(startMinutes - rruleStartMinutes);
          return timeDiff <= 15 && durationMinutes === rruleDuration;
        } catch {
          // If parsing fails, fallback to regex matching
          const dtstartMatch = recurring.rrule.match(
            /DTSTART:(\d{8})T(\d{2})(\d{2})/
          );
          if (!dtstartMatch) return false;

          // Check if this date is in EXDATE
          const exdateMatch = recurring.rrule.match(/EXDATE:([^\n]+)/);
          if (exdateMatch) {
            const exdates = exdateMatch[1].split(',');
            const slotDateStr = format(slotDate, 'yyyyMMdd');
            const isExcluded = exdates.some(exdate =>
              exdate.includes(slotDateStr)
            );
            // If excluded, this slot should be created as one-time
            if (isExcluded) return false;
          }

          const rruleHour = parseInt(dtstartMatch[2], 10);
          const rruleMinute = parseInt(dtstartMatch[3], 10);
          const rruleStartMinutes = rruleHour * 60 + rruleMinute;
          const rruleDuration = recurring.duration_mn;

          const timeDiff = Math.abs(startMinutes - rruleStartMinutes);
          return timeDiff <= 15 && durationMinutes === rruleDuration;
        }
      });

      // Check if slot should be recurring
      const slotShouldBeRecurring = slot.recurring === true;

      // If slot should be recurring and doesn't match an existing recurrence, create a new weekly recurrence
      if (slotShouldBeRecurring && !matchesRecurring) {
        // Get the originalSlot's availabilityId if it exists (to exclude it from the check)
        const originalAvailabilityId = slot.originalSlot?.availabilityId;

        // Check if a recurring availability already exists for this slot
        // Exclude the originalSlot's availability from the check since we're updating it
        const existingRecurring = recurringForDay.find(recurring => {
          // Skip if this is the availability we're updating
          if (
            originalAvailabilityId &&
            recurring.id === originalAvailabilityId
          ) {
            return false;
          }
          try {
            const rule = rrulestr(recurring.rrule);
            const ruleDtstart = rule.options.dtstart;

            let rruleStartMinutes: number;
            if (ruleDtstart) {
              const ruleHour = ruleDtstart.getUTCHours();
              const ruleMinute = ruleDtstart.getUTCMinutes();
              rruleStartMinutes = ruleHour * 60 + ruleMinute;
            } else {
              const dtstartMatch = recurring.rrule.match(
                /DTSTART:(\d{8})T(\d{2})(\d{2})/
              );
              if (!dtstartMatch) return false;
              const rruleHour = parseInt(dtstartMatch[2], 10);
              const rruleMinute = parseInt(dtstartMatch[3], 10);
              rruleStartMinutes = rruleHour * 60 + rruleMinute;
            }

            const rruleDuration = recurring.duration_mn;
            const timeDiff = Math.abs(startMinutes - rruleStartMinutes);
            return timeDiff <= 15 && durationMinutes === rruleDuration;
          } catch {
            return false;
          }
        });

        // Only create if it doesn't already exist
        if (!existingRecurring) {
          // Create Date object with local time
          const slotDate = new Date(targetDate);
          const [slotHours, slotMinutes] = slot.start.split(':').map(Number);
          slotDate.setHours(slotHours, slotMinutes, 0, 0);

          // Map day abbreviations to RRule constants
          const rruleDayMap: Record<string, number> = {
            FR: RRule.FR as unknown as number,
            MO: RRule.MO as unknown as number,
            SA: RRule.SA as unknown as number,
            SU: RRule.SU as unknown as number,
            TH: RRule.TH as unknown as number,
            TU: RRule.TU as unknown as number,
            WE: RRule.WE as unknown as number,
          };

          // Find the day abbreviation for the day of week
          const dayAbbrev = Object.entries(dayMap).find(
            ([, jsDay]) => jsDay === dayOfWeek
          )?.[0];

          if (!dayAbbrev) {
            throw new Error(`Invalid day of week: ${dayOfWeek}`);
          }

          const rruleDay = rruleDayMap[dayAbbrev];
          if (rruleDay === undefined) {
            throw new Error(`Invalid day abbreviation: ${dayAbbrev}`);
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
              `Failed to create recurring availability for ${dayKey}: ${error.message}`
            );
          }
        }
        continue; // Skip creating one-time availability for recurring slots
      }

      // Only create one-time availability if it doesn't match an existing recurrence
      // and doesn't already exist as a one-time availability
      // IMPORTANT: If matchesRecurring is true, the slot is already covered by a recurrence
      // and we should NOT create a one-time availability
      if (!matchesRecurring && !slotShouldBeRecurring) {
        // Get the originalSlot's availabilityId if it exists (to exclude it from the check)
        const originalAvailabilityId = slot.originalSlot?.availabilityId;

        // Check if this slot already exists as a one-time availability
        // Use the same logic as deleteAvailabilityBySlot to extract dtstart from RRULE
        // Exclude the originalSlot's availability from the check since we're updating it
        const alreadyExists = oneTimeAvailabilities?.some(oneTime => {
          // Skip if this is the availability we're updating
          if (originalAvailabilityId && oneTime.id === originalAvailabilityId) {
            return false;
          }
          if (!oneTime.rrule) return false;

          let dtstartToCompare: Date | null = null;

          try {
            // Try to parse the RRULE to extract dtstart
            const rule = rrulestr(oneTime.rrule);
            dtstartToCompare = rule.options.dtstart || null;
          } catch {
            // If parsing fails, try to extract DTSTART from RRULE string using regex
            const dtstartMatch = oneTime.rrule.match(
              /DTSTART:(\d{8})T(\d{2})(\d{2})(\d{2})?/
            );
            if (dtstartMatch) {
              const year = parseInt(dtstartMatch[1].substring(0, 4), 10);
              const month = parseInt(dtstartMatch[1].substring(4, 6), 10) - 1; // Month is 0-indexed
              const day = parseInt(dtstartMatch[1].substring(6, 8), 10);
              const hour = parseInt(dtstartMatch[2], 10);
              const minute = parseInt(dtstartMatch[3], 10);
              dtstartToCompare = new Date(
                Date.UTC(year, month, day, hour, minute, 0)
              );
            }
          }

          // If we still don't have dtstart, try to use dtstart from database as fallback
          if (!dtstartToCompare && oneTime.dtstart) {
            try {
              dtstartToCompare = parseISO(oneTime.dtstart);
            } catch {
              return false;
            }
          }

          // If we still don't have a valid dtstart, skip this availability
          if (!dtstartToCompare) {
            return false;
          }

          // Check if this availability is within the week range
          const oneTimeDateOnly = new Date(dtstartToCompare);
          oneTimeDateOnly.setHours(0, 0, 0, 0);
          const weekStartOnly = new Date(weekStart);
          weekStartOnly.setHours(0, 0, 0, 0);
          const weekEndOnly = new Date(weekEnd);
          weekEndOnly.setHours(23, 59, 59, 999);

          // Skip if outside the week range
          if (
            oneTimeDateOnly < weekStartOnly ||
            oneTimeDateOnly > weekEndOnly
          ) {
            return false;
          }

          // Check if date and time match (within 15 minutes tolerance)
          const dateDiff = Math.abs(
            slotDate.getTime() - dtstartToCompare.getTime()
          );
          const timeMatch = dateDiff <= 15 * 60 * 1000; // 15 minutes
          const durationMatch = oneTime.duration_mn === durationMinutes;

          return timeMatch && durationMatch;
        });

        // Only create if it doesn't already exist
        if (!alreadyExists) {
          // Create Date object with local time (slotDate is already created above)
          // slotDate is created at line 366-368 with setHours() using local time
          // This ensures proper timezone conversion when RRule formats it

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
              `Failed to create availability for ${dayKey}: ${error.message}`
            );
          }
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

  // Find matching recurring availability using RRule
  let matchingAvailability = null;
  const dayMap: Record<string, number> = {
    FR: 5,
    MO: 1,
    SA: 6,
    SU: 0,
    TH: 4,
    TU: 2,
    WE: 3,
  };

  for (const availability of recurringAvailabilities) {
    try {
      // Parse the RRULE using rrulestr
      // rrulestr can return either RRule or RRuleSet (when EXDATE is present)
      const parsedRule = rrulestr(availability.rrule);

      // Handle RRuleSet: get the first rule from the set
      let rule: RRule;
      if (parsedRule instanceof RRuleSet) {
        const rules = parsedRule.rrules();
        if (rules.length === 0) continue;
        rule = rules[0];
      } else {
        rule = parsedRule;
      }

      /**
       * Only daily recurrences with COUNT=1 are not recurring
       */
      if (rule.options.freq === 3 && rule.options.count === 1) continue;

      // Extract BYDAY from RRULE string directly (more reliable than rule.options.byweekday)
      const bydayMatch = availability.rrule.match(/BYDAY=([A-Z]{2})/);
      if (!bydayMatch) continue;

      const rruleDay = bydayMatch[1];
      const jsDayOfWeek = dayMap[rruleDay];

      // Check if the slot's day of week matches the recurrence pattern
      if (jsDayOfWeek !== slotDayOfWeek) continue;

      // Check if time matches (within 15 minutes tolerance)
      const ruleDtstart = rule.options.dtstart || new Date();
      const ruleHour = ruleDtstart.getUTCHours();
      const ruleMinute = ruleDtstart.getUTCMinutes();
      const ruleStartMinutes = ruleHour * 60 + ruleMinute;
      const slotStartMinutes =
        slotStartDate.getHours() * 60 + slotStartDate.getMinutes();

      const timeDiff = Math.abs(slotStartMinutes - ruleStartMinutes);
      if (timeDiff <= 15) {
        matchingAvailability = availability;
        break;
      }
    } catch (parseError) {
      // Skip invalid RRULEs
      console.error(
        `Error parsing RRULE for availability ${availability.id}:`,
        parseError
      );
      continue;
    }
  }

  if (!matchingAvailability) {
    throw new Error('No matching recurring availability found for this slot');
  }

  // Stop the recurrence by setting UNTIL to the day before the slot date
  // This ensures the slot date itself is excluded
  const stopDate = new Date(slotStartDate);
  stopDate.setDate(stopDate.getDate() - 1);
  stopDate.setHours(23, 59, 59, 999); // End of the day before

  // Parse the existing RRULE
  // rrulestr can return either RRule or RRuleSet (when EXDATE is present)
  const parsedRule = rrulestr(matchingAvailability.rrule);

  // Handle RRuleSet: get the first rule from the set
  let rule: RRule;
  if (parsedRule instanceof RRuleSet) {
    const rules = parsedRule.rrules();
    if (rules.length === 0) {
      throw new Error('Invalid RRULE: RRuleSet has no rules');
    }
    rule = rules[0];
  } else {
    rule = parsedRule;
  }

  // Create new RRule options with until set to stop date
  // Preserve all existing options except until
  const newRuleOptions = {
    ...rule.options,
    until: stopDate,
  };

  // Create new RRule with updated options
  const newRule = new RRule(newRuleOptions);

  // If the original rule had EXDATE, preserve them using RRuleSet
  let newRruleString: string;
  if (matchingAvailability.rrule.includes('EXDATE')) {
    const rruleSet = new RRuleSet();
    rruleSet.rrule(newRule);

    // Parse original rule to get EXDATEs
    const originalRuleSet = rrulestr(matchingAvailability.rrule);
    if (originalRuleSet instanceof RRuleSet) {
      const exdates = originalRuleSet.exdates();
      for (const exdate of exdates) {
        rruleSet.exdate(exdate);
      }
    }

    newRruleString = rruleSet.toString();
  } else {
    newRruleString = newRule.toString();
  }

  // Update the availability with the new RRULE
  const { error: updateError } = await supabase
    .from('availabilities')
    .update({ rrule: newRruleString })
    .eq('id', matchingAvailability.id);

  if (updateError) {
    throw new Error(`Failed to stop recurrence: ${updateError.message}`);
  }
}

/**
 * Stop recurrence for a specific slot until a specific date (e.g., mission start)
 */
export async function stopRecurrenceForSlotUntil(
  slot: AvailabilitySlot,
  userId: string,
  untilDate: Date
): Promise<void> {
  const supabase = createClient();

  // Parse the slot start date and time
  const slotStartDate = parseISO(slot.startAt);

  // Find recurring availabilities that match this slot
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

  let matchingAvailability = null;

  for (const availability of recurringAvailabilities) {
    try {
      const parsedRule = rrulestr(availability.rrule);
      let rule: RRule;
      if (parsedRule instanceof RRuleSet) {
        const rules = parsedRule.rrules();
        if (rules.length === 0) continue;
        rule = rules[0];
      } else {
        rule = parsedRule;
      }

      if (rule.options.freq === 3 && rule.options.count === 1) continue;

      const bydayMatch = availability.rrule.match(/BYDAY=([A-Z]{2})/);
      if (!bydayMatch) continue;

      const rruleDay = bydayMatch[1];
      const jsDayOfWeek = dayMap[rruleDay];

      if (jsDayOfWeek !== slotDayOfWeek) continue;

      const ruleDtstart = rule.options.dtstart || new Date();
      const ruleHour = ruleDtstart.getUTCHours();
      const ruleMinute = ruleDtstart.getUTCMinutes();
      const ruleStartMinutes = ruleHour * 60 + ruleMinute;
      const slotStartMinutes =
        slotStartDate.getHours() * 60 + slotStartDate.getMinutes();

      const timeDiff = Math.abs(slotStartMinutes - ruleStartMinutes);
      if (timeDiff <= 15) {
        matchingAvailability = availability;
        break;
      }
    } catch (parseError) {
      console.error(
        `Error parsing RRULE for availability ${availability.id}:`,
        parseError
      );
      continue;
    }
  }

  if (!matchingAvailability) {
    throw new Error('No matching recurring availability found for this slot');
  }

  // Stop the recurrence by setting UNTIL to the day before the slot date
  const stopDate = new Date(slotStartDate);
  stopDate.setDate(stopDate.getDate() - 1);
  stopDate.setHours(23, 59, 59, 999);

  // Parse the existing RRULE
  const parsedRule = rrulestr(matchingAvailability.rrule);
  let rule: RRule;
  if (parsedRule instanceof RRuleSet) {
    const rules = parsedRule.rrules();
    if (rules.length === 0) {
      throw new Error('Invalid RRULE: RRuleSet has no rules');
    }
    rule = rules[0];
  } else {
    rule = parsedRule;
  }

  // Create new RRule options with until set to stop date
  // But if untilDate is provided and is after stopDate, use untilDate instead
  const finalUntilDate =
    untilDate && untilDate > stopDate ? new Date(untilDate) : stopDate;
  finalUntilDate.setHours(23, 59, 59, 999);

  const newRuleOptions = {
    ...rule.options,
    until: finalUntilDate,
  };

  const newRule = new RRule(newRuleOptions);

  let newRruleString: string;
  if (matchingAvailability.rrule.includes('EXDATE')) {
    const rruleSet = new RRuleSet();
    rruleSet.rrule(newRule);

    const originalRuleSet = rrulestr(matchingAvailability.rrule);
    if (originalRuleSet instanceof RRuleSet) {
      const exdates = originalRuleSet.exdates();
      for (const exdate of exdates) {
        rruleSet.exdate(exdate);
      }
    }

    newRruleString = rruleSet.toString();
  } else {
    newRruleString = newRule.toString();
  }

  const { error: updateError } = await supabase
    .from('availabilities')
    .update({ rrule: newRruleString })
    .eq('id', matchingAvailability.id);

  if (updateError) {
    throw new Error(`Failed to stop recurrence: ${updateError.message}`);
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

  const rruleSet = new RRuleSet();
  rruleSet.rrule(rrulestr(rrule));
  rruleSet.exdate(dateToExclude);
  const newRrule = rruleSet.toString();

  const { error: updateError } = await supabase
    .from('availabilities')
    .update({ rrule: newRrule })
    .eq('id', availabilityId);

  if (updateError) {
    throw new Error(`Failed to update availability: ${updateError.message}`);
  }
}

function calculateDurationMinutes(start: string, end: string): number {
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return endTotalMinutes - startTotalMinutes;
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Update an existing availability for a modified slot
 * Updates the start time, duration, and rrule to reflect the slot changes
 */
async function updateAvailabilityForSlot(
  supabase: ReturnType<typeof createClient>,
  existingAvailability: { duration_mn: number; id: string; rrule: string },
  newSlotDate: Date,
  newDurationMinutes: number,
  shouldBeRecurring: boolean,
  dayOfWeek: number,
  dayMap: Record<string, number>
): Promise<void> {
  // Map day abbreviations to RRule constants
  const rruleDayMap: Record<string, number> = {
    FR: RRule.FR as unknown as number,
    MO: RRule.MO as unknown as number,
    SA: RRule.SA as unknown as number,
    SU: RRule.SU as unknown as number,
    TH: RRule.TH as unknown as number,
    TU: RRule.TU as unknown as number,
    WE: RRule.WE as unknown as number,
  };

  // Find the day abbreviation for the day of week
  const dayAbbrev = Object.entries(dayMap).find(
    ([, jsDay]) => jsDay === dayOfWeek
  )?.[0];

  if (!dayAbbrev) {
    throw new Error(`Invalid day of week: ${dayOfWeek}`);
  }

  const rruleDay = rruleDayMap[dayAbbrev];
  if (rruleDay === undefined) {
    throw new Error(`Invalid day abbreviation: ${dayAbbrev}`);
  }

  let updatedRrule: string;

  if (shouldBeRecurring) {
    // Create new recurring rrule with updated start time
    const newRule = new RRule({
      byweekday: [rruleDay],
      dtstart: newSlotDate,
      freq: RRule.WEEKLY,
    });

    // If the existing rule had EXDATEs, preserve them
    if (existingAvailability.rrule.includes('EXDATE')) {
      try {
        const originalRuleSet = rrulestr(existingAvailability.rrule);
        if (originalRuleSet instanceof RRuleSet) {
          const rruleSet = new RRuleSet();
          rruleSet.rrule(newRule);
          const exdates = originalRuleSet.exdates();
          for (const exdate of exdates) {
            rruleSet.exdate(exdate);
          }
          updatedRrule = rruleSet.toString();
        } else {
          updatedRrule = newRule.toString();
        }
      } catch {
        // If parsing fails, use the new rule without EXDATEs
        updatedRrule = newRule.toString();
      }
    } else {
      updatedRrule = newRule.toString();
    }
  } else {
    // Convert to or update as one-time availability
    // Create a one-time rrule (DAILY with COUNT=1)
    const newRule = new RRule({
      count: 1,
      dtstart: newSlotDate,
      freq: RRule.DAILY,
    });
    updatedRrule = newRule.toString();
  }

  // Update the availability
  const { error: updateError } = await supabase
    .from('availabilities')
    .update({
      dtstart: newSlotDate.toISOString(),
      duration_mn: newDurationMinutes,
      rrule: updatedRrule,
    })
    .eq('id', existingAvailability.id);

  if (updateError) {
    throw new Error(`Failed to update availability: ${updateError.message}`);
  }
}
