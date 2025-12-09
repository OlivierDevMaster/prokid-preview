import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import {
  addMinutes,
  compareAsc,
  formatISO,
  isAfter,
  isValid,
  parseISO,
} from 'date-fns';
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

      const { data: availabilities, error } = await supabaseClient
        .from('availabilities')
        .select('duration_mn, dtstart, id, rrule, until')
        .eq('user_id', professionalId)
        .or(`dtstart.lte.${endAt},until.gte.${startAt},until.is.null`);

      if (error) {
        console.error('Error fetching availabilities:', error);
        return apiResponse.internalServerError(
          'Failed to fetch availabilities'
        );
      }

      if (!availabilities || availabilities.length === 0) {
        return apiResponse.ok([]);
      }

      const adminSupabaseClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Fetch all missions for the professional
      // We'll check overlaps using RRULE, so we fetch all missions and filter by date range
      const { data: missions, error: missionsError } = await adminSupabaseClient
        .from('missions')
        .select('*')
        .eq('professional_id', professionalId)
        .or(`dtstart.lte.${endAt},until.gte.${startAt},until.is.null`);

      if (missionsError) {
        console.error('Error fetching missions:', missionsError);
        return apiResponse.internalServerError('Failed to fetch missions');
      }

      const slots: AvailabilitySlot[] = [];

      for (const availability of availabilities) {
        try {
          const rule = rrulestr(availability.rrule);

          const occurrences = rule.between(startDate, endDate, true);

          for (const occurrence of occurrences) {
            const slotStartAt = formatISO(occurrence);
            const slotEndAt = formatISO(
              addMinutes(occurrence, availability.duration_mn)
            );

            const slotStart = parseISO(slotStartAt);
            const slotEnd = parseISO(slotEndAt);

            // Find mission that overlaps with this slot
            let overlappingMission = null;

            if (missions && missions.length > 0) {
              for (const mission of missions) {
                try {
                  const missionRule = rrulestr(mission.rrule);
                  const missionDtstart =
                    missionRule.options.dtstart ||
                    (mission.dtstart ? parseISO(mission.dtstart) : new Date());
                  const missionUntil =
                    missionRule.options.until ||
                    (mission.until
                      ? parseISO(mission.until)
                      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

                  // Generate occurrences for this mission in the time range
                  const missionOccurrences = missionRule.between(
                    slotStart < missionDtstart ? missionDtstart : slotStart,
                    slotEnd > missionUntil ? missionUntil : slotEnd,
                    true
                  );

                  // Check if any occurrence overlaps with this slot
                  for (const missionOcc of missionOccurrences) {
                    const missionOccEnd = new Date(
                      missionOcc.getTime() + mission.duration_mn * 60 * 1000
                    );

                    // Check overlap: slotStart < missionOccEnd AND slotEnd > missionOcc
                    if (
                      slotStart.getTime() < missionOccEnd.getTime() &&
                      slotEnd.getTime() > missionOcc.getTime()
                    ) {
                      overlappingMission = mission;
                      break;
                    }
                  }

                  if (overlappingMission) {
                    break;
                  }
                } catch (rruleError) {
                  console.error(
                    `Error parsing mission ${mission.id} RRULE:`,
                    rruleError
                  );
                  // Continue checking other missions
                }
              }
            }

            // Determine if slot is available (no accepted mission)
            const isAvailable =
              !overlappingMission || overlappingMission.status !== 'accepted';

            slots.push({
              durationMn: availability.duration_mn,
              endAt: slotEndAt,
              isAvailable,
              mission: overlappingMission
                ? {
                    created_at: overlappingMission.created_at,
                    description: overlappingMission.description,
                    dtstart: overlappingMission.dtstart,
                    duration_mn: overlappingMission.duration_mn,
                    id: overlappingMission.id,
                    professional_id: overlappingMission.professional_id,
                    rrule: overlappingMission.rrule,
                    status: overlappingMission.status,
                    structure_id: overlappingMission.structure_id,
                    title: overlappingMission.title,
                    until: overlappingMission.until,
                    updated_at: overlappingMission.updated_at,
                  }
                : null,
              startAt: slotStartAt,
            });
          }
        } catch (rruleError) {
          console.error(
            `Error parsing rrule for availability ${availability.id}:`,
            rruleError
          );
        }
      }

      slots.sort((a, b) =>
        compareAsc(parseISO(a.startAt), parseISO(b.startAt))
      );

      return apiResponse.ok(slots);
    } catch (error) {
      console.error('Error in getAvailabilitySlotsHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
