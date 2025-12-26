import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Resend } from 'resend';
import { z } from 'zod';

import { minifyHtml } from '../../_shared/utils/htmlMinifier.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { renderAppointmentReminderEmailTemplate } from '../../_shared/utils/template.ts';
import { Database } from '../../../../types/database/schema.ts';

const factory = createFactory();

const ProcessRemindersRequestBodySchema = z.object({
  batch_size: z.number().int().positive().max(100).optional().default(50),
});

/**
 * Calculates next retry time with exponential backoff
 */
function calculateNextRetry(attempts: number): Date {
  // Exponential backoff: 1h, 2h, 4h, 8h, max 24h
  const hours = Math.min(Math.pow(2, attempts), 24);
  return new Date(Date.now() + hours * 60 * 60 * 1000);
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

export const processRemindersHandler = factory.createHandlers(
  async ({ req }) => {
    try {
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
        ProcessRemindersRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const { batch_size } = validationResult.data;

      // Select pending reminders using SELECT FOR UPDATE SKIP LOCKED
      // This allows concurrent processing while preventing duplicate work
      const { data: pendingReminders, error: selectError } =
        await supabaseAdminClient.rpc('select_pending_reminders', {
          batch_size_param: batch_size,
        });

      // If RPC doesn't exist, use direct query (fallback)
      let reminders: Array<{
        attempts: number;
        id: string;
        mission_id: string;
        mission_schedule_id: string;
        occurrence_date: string;
        reminder_type: string;
      }> = [];

      if (selectError || !pendingReminders) {
        // Fallback: Use direct query (less safe for concurrency but works)
        const { data, error } = await supabaseAdminClient
          .from('appointment_reminders_pending')
          .select(
            'id, mission_id, mission_schedule_id, occurrence_date, reminder_type, attempts'
          )
          .eq('status', 'pending')
          .or(
            `next_retry_at.is.null,next_retry_at.lte.${new Date().toISOString()}`
          )
          .order('occurrence_date', { ascending: true })
          .limit(batch_size);

        if (error) {
          console.error('Error selecting pending reminders:', error);
          return apiResponse.internalServerError(
            'Failed to select pending reminders',
            { error: error.message }
          );
        }

        reminders = data || [];
      } else {
        reminders = pendingReminders;
      }

      if (reminders.length === 0) {
        return apiResponse.success({
          failed: 0,
          message: 'No pending reminders to process',
          processed: 0,
          sent: 0,
        });
      }

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      const now = new Date();
      let totalSent = 0;
      let totalFailed = 0;

      // Process each reminder
      for (const reminder of reminders) {
        try {
          // Update status to processing
          await supabaseAdminClient
            .from('appointment_reminders_pending')
            .update({
              last_attempt_at: now.toISOString(),
              status: 'processing',
            })
            .eq('id', reminder.id);

          // Fetch mission details
          const { data: mission, error: missionError } =
            await supabaseAdminClient
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
              .eq('id', reminder.mission_id)
              .eq('status', 'accepted')
              .single();

          if (missionError || !mission) {
            // Mission not found or not accepted, cancel reminder
            await supabaseAdminClient
              .from('appointment_reminders_pending')
              .update({
                error_message: 'Mission not found or not accepted',
                status: 'cancelled',
              })
              .eq('id', reminder.id);
            continue;
          }

          // Check notification preferences
          const { data: preferences } = await supabaseAdminClient
            .from('professional_notification_preferences')
            .select('appointment_reminders')
            .eq('user_id', mission.professional_id)
            .single();

          if (!preferences?.appointment_reminders) {
            // Reminders disabled, cancel
            await supabaseAdminClient
              .from('appointment_reminders_pending')
              .update({
                error_message: 'Appointment reminders disabled',
                status: 'cancelled',
              })
              .eq('id', reminder.id);
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

          // Get schedule duration
          const { data: schedule } = await supabaseAdminClient
            .from('mission_schedules')
            .select('duration_mn')
            .eq('id', reminder.mission_schedule_id)
            .single();

          const duration = schedule?.duration_mn || 60;

          // Send reminder based on type
          if (reminder.reminder_type === 'email') {
            try {
              const occurrenceDate = new Date(reminder.occurrence_date);
              const appointmentDateTime = formatDateTime(
                occurrenceDate,
                locale
              );
              const appointmentDuration = formatDuration(duration, locale);

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

              // Record in appointment_reminders (history)
              await supabaseAdminClient.from('appointment_reminders').insert({
                mission_id: reminder.mission_id,
                mission_schedule_id: reminder.mission_schedule_id,
                occurrence_date: reminder.occurrence_date,
                sent_at: now.toISOString(),
              });

              // Update pending reminder to sent
              await supabaseAdminClient
                .from('appointment_reminders_pending')
                .update({
                  processed_at: now.toISOString(),
                  status: 'sent',
                })
                .eq('id', reminder.id);

              totalSent++;
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
              const newAttempts = reminder.attempts + 1;
              const nextRetry =
                newAttempts < 5 ? calculateNextRetry(newAttempts) : null;

              // Update with failure
              await supabaseAdminClient
                .from('appointment_reminders_pending')
                .update({
                  attempts: newAttempts,
                  error_message: errorMessage,
                  next_retry_at: nextRetry?.toISOString() || null,
                  status: newAttempts >= 5 ? 'failed' : 'pending',
                })
                .eq('id', reminder.id);

              totalFailed++;
            }
          } else {
            // Other reminder types (SMS, push) - not implemented yet
            await supabaseAdminClient
              .from('appointment_reminders_pending')
              .update({
                error_message: `Reminder type ${reminder.reminder_type} not implemented`,
                status: 'failed',
              })
              .eq('id', reminder.id);
            totalFailed++;
          }
        } catch (error) {
          console.error(`Error processing reminder ${reminder.id}:`, error);
          // Mark as failed
          await supabaseAdminClient
            .from('appointment_reminders_pending')
            .update({
              error_message:
                error instanceof Error ? error.message : 'Unknown error',
              status: 'failed',
            })
            .eq('id', reminder.id);
          totalFailed++;
        }
      }

      return apiResponse.success({
        failed: totalFailed,
        processed: reminders.length,
        sent: totalSent,
      });
    } catch (error) {
      console.error('Error in processRemindersHandler:', error);
      return apiResponse.internalServerError('Failed to process reminders', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);
