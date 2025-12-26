import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Resend } from 'resend';
import RRulePkg from 'rrule';

import type {
  ReminderResult,
  SendAppointmentRemindersResponse,
} from '../../_shared/features/appointmentReminders/appointmentReminder.model.ts';

import { SendAppointmentRemindersRequestBodySchema } from '../../_shared/features/appointmentReminders/appointmentReminder.schemas.ts';
import { minifyHtml } from '../../_shared/utils/htmlMinifier.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { renderAppointmentReminderEmailTemplate } from '../../_shared/utils/template.ts';
import { Database } from '../../../../types/database/schema.ts';

const { rrulestr } = RRulePkg;

const factory = createFactory();

interface MissionSchedule {
  duration_mn: number;
  rrule: string;
}

/**
 * Formats date and time in French locale
 */
function formatDateTime(date: Date, locale: 'en' | 'fr' = 'fr'): string {
  const localeObj = locale === 'fr' ? fr : undefined;
  return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: localeObj });
}

/**
 * Formats duration in minutes to a readable string
 */
function formatDuration(minutes: number, locale: 'en' | 'fr' = 'fr'): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale === 'fr') {
    if (hours > 0 && mins > 0) {
      return `${hours}h${mins > 0 ? `${mins}min` : ''}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  } else {
    if (hours > 0 && mins > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  }
}

/**
 * Generates all occurrences for a mission schedule within the mission date range
 */
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date
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

  const allOccurrences = rule.between(scheduleStart, scheduleEnd, true);
  return allOccurrences.filter(
    occ => occ >= missionDtstart && occ <= missionUntil
  );
}

export const sendAppointmentRemindersHandler = factory.createHandlers(
  async ({ req }) => {
    try {
      // Create Supabase admin client (this function is called by cron with service role key)
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
        return validationResult.response;
      }

      const { missions } = validationResult.data;

      const now = new Date();
      const reminderWindowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
      const reminderWindowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

      const results: ReminderResult[] = [];
      let totalSent = 0;
      let totalFailed = 0;

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

      // Process each mission
      for (const missionData of missions) {
        const missionDtstart = new Date(missionData.mission_dtstart);
        const missionUntil = new Date(missionData.mission_until);

        // Fetch full mission details with professional and structure info
        const { data: mission, error: missionError } = await supabaseAdminClient
          .from('missions')
          .select(
            `
            id,
            title,
            description,
            professional_id,
            structure_id,
            professionals:professional_id (
              user_id,
              profiles:user_id (
                email,
                first_name,
                last_name,
                preferred_language
              )
            ),
            structures:structure_id (
              user_id,
              name,
              profiles:user_id (
                email
              )
            )
          `
          )
          .eq('id', missionData.mission_id)
          .eq('status', 'accepted')
          .single();

        if (missionError || !mission) {
          console.error(
            `Mission ${missionData.mission_id} not found or not accepted:`,
            missionError
          );
          continue;
        }

        // Check notification preferences
        const { data: preferences } = await supabaseAdminClient
          .from('professional_notification_preferences')
          .select('appointment_reminders')
          .eq('user_id', mission.professional_id)
          .single();

        // Skip if reminders are disabled
        if (!preferences?.appointment_reminders) {
          console.log(
            `Appointment reminders disabled for professional ${mission.professional_id}`
          );
          continue;
        }

        const professional = mission.professionals as {
          profiles: {
            email: string;
            first_name: null | string;
            last_name: null | string;
            preferred_language: 'en' | 'fr';
          };
          user_id: string;
        };

        const structure = mission.structures as {
          name: string;
          profiles: {
            email: string;
          };
          user_id: string;
        };

        const professionalEmail = professional?.profiles?.email;
        const professionalName =
          professional?.profiles?.first_name &&
          professional?.profiles?.last_name
            ? `${professional.profiles.first_name} ${professional.profiles.last_name}`
            : professional?.profiles?.first_name ||
              professional?.profiles?.last_name ||
              'Professional';

        const locale = professional?.profiles?.preferred_language || 'fr';

        // Process each schedule
        for (const schedule of missionData.schedules) {
          // Generate occurrences for this schedule
          const occurrences = generateMissionOccurrences(
            schedule,
            missionDtstart,
            missionUntil
          );

          // Filter occurrences that are in the 24h reminder window (23-25h from now)
          const occurrencesNeedingReminders = occurrences.filter(occ => {
            return occ >= reminderWindowStart && occ <= reminderWindowEnd;
          });

          for (const occurrenceDate of occurrencesNeedingReminders) {
            // Check if reminder already sent
            const { data: existingReminder } = await supabaseAdminClient
              .from('appointment_reminders')
              .select('id')
              .eq('mission_schedule_id', schedule.schedule_id)
              .eq('occurrence_date', occurrenceDate.toISOString())
              .single();

            if (existingReminder) {
              console.log(
                `Reminder already sent for schedule ${schedule.schedule_id}, occurrence ${occurrenceDate.toISOString()}`
              );
              continue;
            }

            // Send reminder email
            try {
              const appointmentDateTime = formatDateTime(
                occurrenceDate,
                locale
              );
              const appointmentDuration = formatDuration(
                schedule.duration_mn,
                locale
              );

              const templateData = {
                appointment_date_time: appointmentDateTime,
                appointment_duration: appointmentDuration,
                footer_text:
                  locale === 'fr'
                    ? `Rappel envoyé le: ${format(now, 'dd/MM/yyyy à HH:mm', { locale: fr })} | Mission: ${mission.title}`
                    : `Reminder sent on: ${format(now, 'MM/dd/yyyy at HH:mm')} | Mission: ${mission.title}`,
                mission_description: mission.description || '',
                mission_title: mission.title,
                professional_email: professionalEmail,
                professional_name: professionalName,
                structure_name: structure?.name || 'Structure',
                title:
                  locale === 'fr'
                    ? 'Rappel de rendez-vous'
                    : 'Appointment Reminder',
              };

              const emailHtmlRaw =
                renderAppointmentReminderEmailTemplate(templateData);
              const emailHtml = await minifyHtml(emailHtmlRaw);

              const emailSubject =
                locale === 'fr'
                  ? `Rappel: ${mission.title} - ${appointmentDateTime}`
                  : `Reminder: ${mission.title} - ${appointmentDateTime}`;

              const fromEmail = Deno.env.get('NOREPLY_EMAIL');

              if (!fromEmail) {
                throw new Error('NOREPLY_EMAIL is not configured');
              }

              const { error: emailError } = await resend.emails.send({
                from: fromEmail,
                html: emailHtml,
                subject: emailSubject,
                to: professionalEmail,
              });

              if (emailError) {
                throw new Error(
                  emailError.message || 'Failed to send email via Resend'
                );
              }

              // Record reminder in database
              const { error: insertError } = await supabaseAdminClient
                .from('appointment_reminders')
                .insert({
                  mission_id: missionData.mission_id,
                  mission_schedule_id: schedule.schedule_id,
                  occurrence_date: occurrenceDate.toISOString(),
                  sent_at: now.toISOString(),
                });

              if (insertError) {
                console.error(
                  `Failed to record reminder for schedule ${schedule.schedule_id}:`,
                  insertError
                );
                // Don't fail the whole operation, but log the error
              }

              results.push({
                mission_id: missionData.mission_id,
                occurrence_date: occurrenceDate.toISOString(),
                schedule_id: schedule.schedule_id,
                success: true,
              });

              totalSent++;
            } catch (error) {
              console.error(
                `Failed to send reminder for schedule ${schedule.schedule_id}, occurrence ${occurrenceDate.toISOString()}:`,
                error
              );

              results.push({
                error: error instanceof Error ? error.message : 'Unknown error',
                mission_id: missionData.mission_id,
                occurrence_date: occurrenceDate.toISOString(),
                schedule_id: schedule.schedule_id,
                success: false,
              });

              totalFailed++;
            }
          }
        }
      }

      const response: SendAppointmentRemindersResponse = {
        results,
        total_failed: totalFailed,
        total_processed: missions.length,
        total_sent: totalSent,
      };

      return apiResponse.ok(response);
    } catch (error) {
      console.error('Error in sendAppointmentRemindersHandler:', error);
      return apiResponse.internalServerError(
        'Failed to process appointment reminders',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }
);
