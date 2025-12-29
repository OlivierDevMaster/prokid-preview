import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import {
  addMinutes,
  compareAsc,
  formatISO,
  isAfter,
  isValid,
  parseISO,
} from 'npm:date-fns@^4.1.0';
// ! rrule package is a CommonJS package, so we need to import it as a namespace
// ! and then destructure the rrulestr function from it
import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

import {
  AvailabilitySlot,
  GetAvailabilitySlotsQuerySchema,
} from '../../_shared/features/availabilities/index.ts';
import { validateRequestQuery } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const factory = createFactory();

export const getAvailabilitySlotsHandler = factory.createHandlers(
  async ({ req }) => {
    try {
      const supabaseClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const validationResult = validateRequestQuery(
        GetAvailabilitySlotsQuerySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const { endAt, professionalId, startAt } = validationResult.data;

      const startDate = parseISO(startAt);
      const endDate = parseISO(endAt);

      if (!isValid(startDate) || !isValid(endDate)) {
        return apiResponse.badRequest(
          'INVALID_DATE_FORMAT',
          'Invalid date format. Dates must be in ISO 8601 format.'
        );
      }

      if (
        isAfter(startDate, endDate) ||
        startDate.getTime() === endDate.getTime()
      ) {
        return apiResponse.badRequest(
          'INVALID_DATE_RANGE',
          'startAt must be before endAt'
        );
      }

      const adminSupabaseClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Fetch all availabilities for the professional
      // RRULE is the single source of truth - dates are extracted from RRULE only
      const { data: availabilities, error: availabilitiesError } =
        await supabaseClient
          .from('availabilities')
          .select('duration_mn, id, rrule')
          .eq('user_id', professionalId);

      if (availabilitiesError) {
        console.error('Error fetching availabilities:', availabilitiesError);
        return apiResponse.internalServerError(
          'Failed to fetch availabilities'
        );
      }

      // Fetch all accepted missions for the professional
      // RRULE is the single source of truth - dates are extracted from RRULE only
      // Note: We assume availabilities have been properly updated by acceptMissionHandler
      // to exclude mission periods. No overlap checking is performed here.
      const { data: missions, error: missionsError } = await adminSupabaseClient
        .from('missions')
        .select(
          `
            *,
            mission_schedules (
              id,
              rrule,
              duration_mn
            )
          `
        )
        .eq('professional_id', professionalId)
        .eq('status', 'accepted');

      if (missionsError) {
        console.error('Error fetching missions:', missionsError);
        return apiResponse.internalServerError('Failed to fetch missions');
      }

      const slots: AvailabilitySlot[] = [];

      // Generate slots from availabilities (free slots)
      // Extract dates from RRULE only - RRULE is the single source of truth
      if (availabilities && availabilities.length > 0) {
        for (const availability of availabilities) {
          try {
            let isRecurring = false;
            const rule = rrulestr(availability.rrule);

            // Extract dtstart and until from RRULE
            // If until is null/undefined, availability continues indefinitely
            const availabilityDtstart = rule.options.dtstart;
            const availabilityUntil = rule.options.until;

            // Only process if availability overlaps with requested date range
            // Overlap occurs when: availability starts before/at endDate AND (availability ends after/at startDate OR continues indefinitely)
            const hasOverlap =
              (!availabilityDtstart || availabilityDtstart <= endDate) &&
              (!availabilityUntil || availabilityUntil >= startDate);

            /**
             * Determine if the availability is recurring:
             * - YEARLY (0), MONTHLY (1), WEEKLY (2) are always recurring
             * - DAILY (3) is recurring unless COUNT=1 (one-time availability)
             */
            const freq = rule.options.freq;
            const count = rule.options.count;

            // ADD IF THE SLOT IS RECURRING TO DETERMINE IF THE SLOT SHOULD BE STOPPED
            if (freq === 0 || freq === 1 || freq === 2) {
              // YEARLY, MONTHLY, or WEEKLY - always recurring
              isRecurring = true;
            } else if (freq === 3) {
              // DAILY - recurring unless COUNT=1 (one-time)
              isRecurring = count !== 1;
            }

            if (hasOverlap) {
              const occurrences = rule.between(startDate, endDate, true);

              for (const occurrence of occurrences) {
                const slotStartAt = formatISO(occurrence);
                const slotEndAt = formatISO(
                  addMinutes(occurrence, availability.duration_mn)
                );

                slots.push({
                  durationMn: availability.duration_mn,
                  endAt: slotEndAt,
                  isAvailable: true,
                  isRecurring,
                  mission: null,
                  startAt: slotStartAt,
                });
              }
            }
          } catch (rruleError) {
            console.error(
              `Error parsing rrule for availability ${availability.id}:`,
              rruleError
            );
          }
        }
      }

      // Generate slots from accepted missions (booked slots)
      if (missions && missions.length > 0) {
        for (const mission of missions) {
          if (
            !mission.mission_schedules ||
            mission.mission_schedules.length === 0
          ) {
            continue;
          }

          for (const schedule of mission.mission_schedules) {
            try {
              const missionRule = rrulestr(schedule.rrule);

              // Extract dtstart and until from RRULE only - RRULE is the single source of truth
              // If until is null/undefined, mission schedule continues indefinitely
              const missionDtstart = missionRule.options.dtstart;
              const missionUntil = missionRule.options.until;

              // Only process if mission schedule overlaps with requested date range
              // Overlap occurs when: mission starts before/at endDate AND (mission ends after/at startDate OR continues indefinitely)
              const hasOverlap =
                (!missionDtstart || missionDtstart <= endDate) &&
                (!missionUntil || missionUntil >= startDate);

              if (hasOverlap) {
                // Generate occurrences for this mission schedule in the time range
                const effectiveStart = missionDtstart
                  ? startDate < missionDtstart
                    ? missionDtstart
                    : startDate
                  : startDate;
                const effectiveEnd = missionUntil
                  ? endDate > missionUntil
                    ? missionUntil
                    : endDate
                  : endDate;

                const missionOccurrences = missionRule.between(
                  effectiveStart,
                  effectiveEnd,
                  true
                );

                for (const missionOcc of missionOccurrences) {
                  const slotStartAt = formatISO(missionOcc);
                  const slotEndAt = formatISO(
                    addMinutes(missionOcc, schedule.duration_mn)
                  );

                  // Extract dtstart and until from RRULE for mission metadata
                  const scheduleDtstart = missionRule.options.dtstart
                    ? formatISO(missionRule.options.dtstart)
                    : '';
                  const scheduleUntil = missionRule.options.until
                    ? formatISO(missionRule.options.until)
                    : '';

                  slots.push({
                    durationMn: schedule.duration_mn,
                    endAt: slotEndAt,
                    isAvailable: false,
                    mission: {
                      created_at: mission.created_at,
                      description: mission.description,
                      id: mission.id,
                      mission_dtstart: scheduleDtstart,
                      mission_until: scheduleUntil,
                      professional_id: mission.professional_id,
                      status: mission.status,
                      structure_id: mission.structure_id,
                      title: mission.title,
                      updated_at: mission.updated_at,
                    },
                    startAt: slotStartAt,
                  });
                }
              }
            } catch (rruleError) {
              console.error(
                `Error parsing mission schedule ${schedule.id} RRULE:`,
                rruleError
              );
              // Continue with other schedules
            }
          }
        }
      }

      // Deduplicate slots by preferring booked slots over free slots
      // This handles edge cases where availability updates might have failed
      const slotMap = new Map<string, AvailabilitySlot>();
      for (const slot of slots) {
        const key = `${slot.startAt}-${slot.endAt}`;
        const existingSlot = slotMap.get(key);

        if (!existingSlot) {
          slotMap.set(key, slot);
        } else if (!slot.isAvailable && existingSlot.isAvailable) {
          // Prefer booked slot over free slot
          slotMap.set(key, slot);
        }
      }

      const deduplicatedSlots = Array.from(slotMap.values());

      // Log warning if overlaps are detected (should not happen in normal operation)
      if (deduplicatedSlots.length < slots.length) {
        console.warn(
          `Detected ${slots.length - deduplicatedSlots.length} overlapping slots. This may indicate availability updates failed.`
        );
      }

      // Sort all slots by start time
      deduplicatedSlots.sort((a, b) =>
        compareAsc(parseISO(a.startAt), parseISO(b.startAt))
      );

      return apiResponse.ok(deduplicatedSlots);
    } catch (error) {
      console.error('Error in getAvailabilitySlotsHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
