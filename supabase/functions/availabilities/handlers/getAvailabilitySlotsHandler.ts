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

      // Fetch all missions for the professional that overlap with the date range
      // A mission overlaps if: mission_dtstart <= endAt AND (mission_until >= startAt OR mission_until IS NULL)
      // We need to fetch missions with their schedules to check overlaps
      // Use separate queries to handle the OR condition properly
      const { data: missionsWithUntil, error: missionsWithUntilError } =
        await adminSupabaseClient
          .from('missions')
          .select(
            `
            *,
            mission_schedules (
              id,
              rrule,
              duration_mn,
              dtstart,
              until
            )
          `
          )
          .eq('professional_id', professionalId)
          .lte('mission_dtstart', endAt)
          .gte('mission_until', startAt);

      const { data: missionsWithoutUntil, error: missionsWithoutUntilError } =
        await adminSupabaseClient
          .from('missions')
          .select(
            `
            *,
            mission_schedules (
              id,
              rrule,
              duration_mn,
              dtstart,
              until
            )
          `
          )
          .eq('professional_id', professionalId)
          .lte('mission_dtstart', endAt)
          .is('mission_until', null);

      if (missionsWithUntilError || missionsWithoutUntilError) {
        console.error('Error fetching missions:', {
          withoutUntil: missionsWithoutUntilError,
          withUntil: missionsWithUntilError,
        });
        return apiResponse.internalServerError('Failed to fetch missions');
      }

      // Combine and deduplicate missions (in case a mission appears in both queries)
      const missionMap = new Map<string, (typeof missionsWithUntil)[0]>();
      if (missionsWithUntil) {
        for (const mission of missionsWithUntil) {
          missionMap.set(mission.id, mission);
        }
      }
      if (missionsWithoutUntil) {
        for (const mission of missionsWithoutUntil) {
          if (!missionMap.has(mission.id)) {
            missionMap.set(mission.id, mission);
          }
        }
      }
      const missions = Array.from(missionMap.values());

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
            // Missions have schedules, so we need to check each schedule's RRULE
            let overlappingMission = null;
            let overlappingSchedule = null;

            if (missions && missions.length > 0) {
              for (const mission of missions) {
                // Check each schedule of this mission
                if (
                  mission.mission_schedules &&
                  mission.mission_schedules.length > 0
                ) {
                  for (const schedule of mission.mission_schedules) {
                    try {
                      const missionRule = rrulestr(schedule.rrule);
                      const missionDtstart =
                        missionRule.options.dtstart ||
                        (schedule.dtstart
                          ? parseISO(schedule.dtstart)
                          : parseISO(mission.mission_dtstart));
                      const missionUntil =
                        missionRule.options.until ||
                        (schedule.until
                          ? parseISO(schedule.until)
                          : parseISO(mission.mission_until));

                      // Generate occurrences for this mission schedule in the time range
                      const missionOccurrences = missionRule.between(
                        slotStart < missionDtstart ? missionDtstart : slotStart,
                        slotEnd > missionUntil ? missionUntil : slotEnd,
                        true
                      );

                      // Check if any occurrence overlaps with this slot
                      for (const missionOcc of missionOccurrences) {
                        const missionOccEnd = new Date(
                          missionOcc.getTime() +
                            schedule.duration_mn * 60 * 1000
                        );

                        // Check overlap: slotStart < missionOccEnd AND slotEnd > missionOcc
                        if (
                          slotStart.getTime() < missionOccEnd.getTime() &&
                          slotEnd.getTime() > missionOcc.getTime()
                        ) {
                          overlappingMission = mission;
                          overlappingSchedule = schedule;
                          break;
                        }
                      }

                      if (overlappingMission) {
                        break;
                      }
                    } catch (rruleError) {
                      console.error(
                        `Error parsing mission schedule ${schedule.id} RRULE:`,
                        rruleError
                      );
                      // Continue checking other schedules
                    }
                  }
                }

                if (overlappingMission) {
                  break;
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
              mission:
                overlappingMission && overlappingSchedule
                  ? ({
                      created_at: overlappingMission.created_at,
                      description: overlappingMission.description,
                      dtstart: overlappingSchedule.dtstart,
                      duration_mn: overlappingSchedule.duration_mn,
                      id: overlappingMission.id,
                      professional_id: overlappingMission.professional_id,
                      rrule: overlappingSchedule.rrule,
                      status: overlappingMission.status,
                      structure_id: overlappingMission.structure_id,
                      title: overlappingMission.title,
                      until: overlappingSchedule.until,
                      updated_at: overlappingMission.updated_at,
                    } as any)
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
