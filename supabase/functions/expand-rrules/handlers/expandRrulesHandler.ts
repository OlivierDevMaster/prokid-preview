import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import RRulePkg from 'rrule';

import { SendAppointmentRemindersRequestBodySchema } from '../../_shared/features/appointmentReminders/appointmentReminder.schemas.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const { rrulestr } = RRulePkg;

const factory = createFactory();

interface MissionSchedule {
  duration_mn: number;
  rrule: string;
}

/**
 * Generates all occurrences for a mission schedule within the mission date range
 * and filters to the 24h reminder window (23-25 hours from now)
 */
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date,
  reminderWindowStart: Date,
  reminderWindowEnd: Date
): Date[] {
  const rule = rrulestr(schedule.rrule);

  let scheduleStart: Date;
  let scheduleEnd: Date;

  if (
    rule instanceof RRulePkg.RRuleSet ||
    typeof (rule as RRulePkg.RRuleSet).rrules === 'function'
  ) {
    const rruleSet = rule as RRulePkg.RRuleSet;
    const rules = rruleSet.rrules();

    if (rules.length > 0) {
      const firstRule = rules[0];
      scheduleStart = firstRule.options.dtstart || missionDtstart;
      scheduleEnd = firstRule.options.until || missionUntil;
    } else {
      return [];
    }
  } else {
    const rrule = rule as RRulePkg.RRule;
    scheduleStart = rrule.options.dtstart || missionDtstart;
    scheduleEnd =
      rrule.options.until !== undefined && rrule.options.until !== null
        ? rrule.options.until
        : missionUntil;
  }

  if (scheduleEnd < scheduleStart) {
    return [];
  }

  // Generate all occurrences within mission date range
  const allOccurrences = rule.between(scheduleStart, scheduleEnd, true);
  const missionOccurrences = allOccurrences.filter(
    occ => occ >= missionDtstart && occ <= missionUntil
  );

  // Filter to reminder window (23-25 hours from now)
  return missionOccurrences.filter(
    occ => occ >= reminderWindowStart && occ <= reminderWindowEnd
  );
}

export const expandRrulesHandler = factory.createHandlers(async ({ req }) => {
  try {
    console.log('[expand-rrules] Request received');

    // Create Supabase admin client
    const supabaseAdminClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`,
          },
        },
      }
    );

    // Validate request body
    const validationResult = await validateRequestBody(
      SendAppointmentRemindersRequestBodySchema,
      req
    );

    if (!validationResult.success) {
      // Try to extract error details from response
      try {
        const responseClone = validationResult.response.clone();
        const errorBody = await responseClone.json();
        console.error('[expand-rrules] Validation failed:', errorBody);
      } catch {
        console.error(
          '[expand-rrules] Validation failed (could not parse error response)'
        );
      }
      return validationResult.response;
    }

    console.log('[expand-rrules] Validation passed');

    const { missions } = validationResult.data;

    console.log(`[expand-rrules] Processing ${missions.length} mission(s)`);

    // Log payload structure
    if (missions.length > 0) {
      const firstMission = missions[0];
      console.log(
        `[expand-rrules] Mission ${firstMission.mission_id}: ${firstMission.schedules.length} schedule(s), dates: ${firstMission.mission_dtstart} to ${firstMission.mission_until}`
      );
    }

    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
    const reminderWindowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

    console.log(
      `[expand-rrules] Reminder window: ${reminderWindowStart.toISOString()} to ${reminderWindowEnd.toISOString()}`
    );

    let totalQueued = 0;
    const errors: string[] = [];

    // Process each mission
    for (const missionData of missions) {
      console.log(
        `[expand-rrules] Processing mission: ${missionData.mission_id}`
      );
      try {
        const missionDtstart = new Date(missionData.mission_dtstart);
        const missionUntil = new Date(missionData.mission_until);

        // Process each schedule
        for (const schedule of missionData.schedules) {
          try {
            console.log(
              `[expand-rrules] Processing schedule: ${schedule.schedule_id} (${missionData.schedules.length} total)`
            );

            // Generate occurrences in reminder window
            const occurrences = generateMissionOccurrences(
              schedule,
              missionDtstart,
              missionUntil,
              reminderWindowStart,
              reminderWindowEnd
            );

            console.log(
              `[expand-rrules] Schedule ${schedule.schedule_id}: ${occurrences.length} occurrence(s) in reminder window`
            );

            // For each occurrence, check if already queued or sent, then insert
            for (const occurrenceDate of occurrences) {
              try {
                // Check if already in pending queue
                const { data: existingPending } = await supabaseAdminClient
                  .from('appointment_reminders_pending')
                  .select('id')
                  .eq('mission_schedule_id', schedule.schedule_id)
                  .eq('occurrence_date', occurrenceDate.toISOString())
                  .eq('reminder_type', 'email')
                  .single();

                if (existingPending) {
                  // Already queued, skip
                  continue;
                }

                // Check if already sent
                const { data: existingSent } = await supabaseAdminClient
                  .from('appointment_reminders')
                  .select('id')
                  .eq('mission_schedule_id', schedule.schedule_id)
                  .eq('occurrence_date', occurrenceDate.toISOString())
                  .single();

                if (existingSent) {
                  // Already sent, skip
                  continue;
                }

                // Insert into pending queue
                const { error: insertError } = await supabaseAdminClient
                  .from('appointment_reminders_pending')
                  .insert({
                    mission_id: missionData.mission_id,
                    mission_schedule_id: schedule.schedule_id,
                    occurrence_date: occurrenceDate.toISOString(),
                    reminder_type: 'email',
                    status: 'pending',
                  });

                if (insertError) {
                  // If it's a unique constraint violation, it's okay (race condition)
                  if (insertError.code !== '23505') {
                    errors.push(
                      `Failed to queue reminder for schedule ${schedule.schedule_id}, occurrence ${occurrenceDate.toISOString()}: ${insertError.message}`
                    );
                  }
                } else {
                  totalQueued++;
                }
              } catch (error) {
                const errorMsg = `Error processing occurrence ${occurrenceDate.toISOString()}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                console.error(`[expand-rrules] ${errorMsg}`);
                errors.push(errorMsg);
              }
            }
          } catch (error) {
            const errorMsg = `Error expanding RRULE for schedule ${schedule.schedule_id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error(`[expand-rrules] ${errorMsg}`);
            errors.push(errorMsg);
          }
        }
      } catch (error) {
        const errorMsg = `Error processing mission ${missionData.mission_id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[expand-rrules] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(
      `[expand-rrules] Completed: ${totalQueued} reminder(s) queued, ${errors.length} error(s)`
    );

    return apiResponse.ok({
      errors: errors.length > 0 ? errors : undefined,
      total_missions: missions.length,
      total_queued: totalQueued,
    });
  } catch (error) {
    console.error('[expand-rrules] Fatal error:', error);
    return apiResponse.internalServerError(
      'Failed to expand RRULEs and queue reminders',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    );
  }
});
