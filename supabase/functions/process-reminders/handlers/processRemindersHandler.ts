import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import { format } from 'npm:date-fns@^4.1.0';
import { fr } from 'npm:date-fns@^4.1.0/locale/fr';
import { Resend } from 'resend';
import { z } from 'zod';

import { renderAppointmentReminderEmailTemplate } from '../../_shared/services/templates/renderAppointmentReminderEmailTemplate.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const factory = createFactory();

const ProcessRemindersRequestBodySchema = z.object({
  batch_size: z.number().int().positive().max(10).optional().default(1),
});

/**
 * Calculates next retry time with exponential backoff
 */
function calculateNextRetry(attempts: number): Date {
  // Exponential backoff: 1h, 2h, 4h, 8h, max 24h
  const hours = Math.min(Math.pow(2, attempts), 24);
  return new Date(Date.now() + hours * 60 * 60 * 1000);
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

      console.log('[process-reminders] Starting with batch_size:', batch_size);

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
        console.log('[process-reminders] No pending reminders found');
        return apiResponse.ok({
          failed: 0,
          message: 'No pending reminders to process',
          processed: 0,
          sent: 0,
        });
      }

      console.log(
        '[process-reminders] Found',
        reminders.length,
        'reminders to process'
      );

      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      const resend = new Resend(resendApiKey);
      console.log(
        '[process-reminders] Resend API key configured:',
        !!resendApiKey
      );

      const now = new Date();
      let totalSent = 0;
      let totalFailed = 0;

      // Process each reminder
      for (const reminder of reminders) {
        console.log(
          '[process-reminders] Processing reminder:',
          reminder.id,
          'for mission:',
          reminder.mission_id
        );
        try {
          // Update status to processing
          await supabaseAdminClient
            .from('appointment_reminders_pending')
            .update({
              last_attempt_at: now.toISOString(),
              status: 'processing',
            })
            .eq('id', reminder.id);

          // Fetch mission details (without nested relationships to avoid ambiguity)
          const { data: mission, error: missionError } =
            await supabaseAdminClient
              .from('missions')
              .select('id, title, description, professional_id, structure_id')
              .eq('id', reminder.mission_id)
              .eq('status', 'accepted')
              .single();

          if (missionError || !mission) {
            console.log(
              '[process-reminders] Mission not found or not accepted for reminder:',
              reminder.id,
              'error:',
              missionError?.message
            );
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

          console.log(
            '[process-reminders] Mission found:',
            mission.id,
            'title:',
            mission.title
          );

          // Fetch professional profile separately to avoid relationship ambiguity
          const { data: professionalProfile, error: profileError } =
            await supabaseAdminClient
              .from('profiles')
              .select('email, first_name, last_name, preferred_language')
              .eq('user_id', mission.professional_id)
              .single();

          if (profileError || !professionalProfile) {
            console.log(
              '[process-reminders] Professional profile not found for reminder:',
              reminder.id,
              'error:',
              profileError?.message
            );
            await supabaseAdminClient
              .from('appointment_reminders_pending')
              .update({
                error_message: 'Professional profile not found',
                status: 'cancelled',
              })
              .eq('id', reminder.id);
            continue;
          }

          console.log(
            '[process-reminders] Professional profile email:',
            professionalProfile.email
          );

          // Fetch structure details separately
          const { data: structure } = await supabaseAdminClient
            .from('structures')
            .select('name, user_id')
            .eq('user_id', mission.structure_id)
            .single();

          // Fetch structure profile email if structure exists
          let structureEmail = '';
          if (structure) {
            const { data: structureProfile } = await supabaseAdminClient
              .from('profiles')
              .select('email')
              .eq('user_id', structure.user_id)
              .single();
            structureEmail = structureProfile?.email || '';
          }

          // Check notification preferences
          const { data: preferences } = await supabaseAdminClient
            .from('professional_notification_preferences')
            .select('appointment_reminders')
            .eq('user_id', mission.professional_id)
            .single();

          console.log(
            '[process-reminders] Notification preferences:',
            preferences?.appointment_reminders
          );

          if (!preferences?.appointment_reminders) {
            console.log(
              '[process-reminders] Reminders disabled, cancelling reminder:',
              reminder.id
            );
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

          const professionalEmail = professionalProfile.email;
          const locale =
            (professionalProfile.preferred_language as 'en' | 'fr') || 'fr';

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

              const emailHtml = await renderAppointmentReminderEmailTemplate({
                durationMinutes: duration,
                locale,
                mission: {
                  description: mission.description,
                  title: mission.title,
                },
                occurrenceDate,
                professional: {
                  email: professionalEmail,
                  firstName: professionalProfile.first_name,
                  lastName: professionalProfile.last_name,
                },
                sentAt: now,
                structure: structure
                  ? {
                      email: structureEmail,
                      name: structure.name,
                    }
                  : null,
              });

              // Format date for email subject
              const appointmentDateTime = format(
                occurrenceDate,
                locale === 'fr'
                  ? "EEEE d MMMM yyyy 'à' HH:mm"
                  : "EEEE, MMMM d, yyyy 'at' HH:mm",
                { locale: locale === 'fr' ? fr : undefined }
              );
              const emailSubject =
                locale === 'fr'
                  ? `Rappel: ${mission.title} - ${appointmentDateTime}`
                  : `Reminder: ${mission.title} - ${appointmentDateTime}`;

              const fromEmail = Deno.env.get('NOREPLY_EMAIL');

              if (!fromEmail) {
                console.error(
                  '[process-reminders] NOREPLY_EMAIL not configured'
                );
                throw new Error('NOREPLY_EMAIL is not configured');
              }

              console.log('[process-reminders] Sending email:', {
                from: fromEmail,
                reminderId: reminder.id,
                subject: emailSubject,
                to: professionalEmail,
              });

              const { data: emailData, error: emailError } =
                await resend.emails.send({
                  from: fromEmail,
                  html: emailHtml,
                  subject: emailSubject,
                  to: professionalEmail,
                });

              if (emailError) {
                console.error('[process-reminders] Email send failed:', {
                  error: emailError.message,
                  errorDetails: emailError,
                  reminderId: reminder.id,
                });
                throw new Error(
                  emailError.message || 'Failed to send email via Resend'
                );
              }

              console.log('[process-reminders] Email sent successfully:', {
                emailId: emailData?.id,
                reminderId: reminder.id,
                to: professionalEmail,
              });

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
              console.log(
                '[process-reminders] Reminder processed successfully, totalSent:',
                totalSent
              );
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
              const newAttempts = reminder.attempts + 1;
              const nextRetry =
                newAttempts < 5 ? calculateNextRetry(newAttempts) : null;

              console.error('[process-reminders] Error processing reminder:', {
                attempts: newAttempts,
                error: errorMessage,
                reminderId: reminder.id,
              });

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

      console.log('[process-reminders] Completed processing:', {
        failed: totalFailed,
        processed: reminders.length,
        sent: totalSent,
      });

      return apiResponse.ok({
        failed: totalFailed,
        processed: reminders.length,
        sent: totalSent,
      });
    } catch (error) {
      console.error('[process-reminders] Fatal error:', error);
      return apiResponse.internalServerError('Failed to process reminders', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);
