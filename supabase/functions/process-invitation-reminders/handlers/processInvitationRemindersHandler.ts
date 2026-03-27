import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const factory = createFactory();

const REMINDER_SUBJECTS: Record<string, string> = {
  j3: 'Votre compte ProKid vous attend !',
  j7: "N'oubliez pas de compl\u00e9ter votre profil ProKid",
  j14: 'Derni\u00e8re chance pour rejoindre ProKid',
  j30: 'Votre invitation ProKid expire bient\u00f4t',
};

function buildReminderEmailHtml(params: {
  appUrl: string;
  firstName: string | null;
  reminderType: string;
  resetLink: string;
}): string {
  const { appUrl, firstName, reminderType, resetLink } = params;

  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';

  const messageByType: Record<string, string> = {
    j3: "Vous avez \u00e9t\u00e9 invit\u00e9(e) \u00e0 rejoindre ProKid il y a quelques jours. Votre compte est pr\u00eat et n'attend plus que vous\u00a0!",
    j7: "Cela fait une semaine que votre compte ProKid a \u00e9t\u00e9 cr\u00e9\u00e9. N'oubliez pas de compl\u00e9ter votre profil pour \u00eatre visible aupr\u00e8s des structures de la petite enfance.",
    j14: "Votre profil ProKid n'est toujours pas compl\u00e9t\u00e9. Rejoignez la communaut\u00e9 des professionnels de la petite enfance et acc\u00e9dez \u00e0 de nouvelles opportunit\u00e9s.",
    j30: "C'est votre derni\u00e8re chance\u00a0! Votre invitation ProKid arrive bient\u00f4t \u00e0 expiration. Compl\u00e9tez votre profil d\u00e8s maintenant.",
  };

  const message =
    messageByType[reminderType] ||
    'Votre compte ProKid vous attend. Compl\u00e9tez votre profil pour commencer.';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${REMINDER_SUBJECTS[reminderType] || 'Rappel ProKid'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">ProKid</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${greeting}</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${message}
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #2563eb;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Compl\u00e9ter mon profil
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
                Si vous ne souhaitez plus recevoir ces rappels, vous pouvez ignorer cet email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} ProKid. Tous droits r\u00e9serv\u00e9s.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const processInvitationRemindersHandler = factory.createHandlers(
  async () => {
    try {
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

      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      const fromEmail = Deno.env.get('NOREPLY_EMAIL');
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

      if (!resendApiKey || !fromEmail) {
        console.error(
          '[process-invitation-reminders] RESEND_API_KEY or NOREPLY_EMAIL not configured'
        );
        return apiResponse.internalServerError(
          'Email configuration missing'
        );
      }

      const resend = new Resend(resendApiKey);

      // 1. Mark reminders as sent for users who already completed onboarding
      const { data: completedReminders } = await supabaseAdminClient
        .from('invitation_reminders')
        .select('id, profile_id')
        .is('sent_at', null)
        .lte('scheduled_at', new Date().toISOString());

      let skippedCount = 0;
      let sentCount = 0;
      let errorCount = 0;
      const errors: Array<{ email: string; error: string }> = [];

      if (!completedReminders || completedReminders.length === 0) {
        console.log('[process-invitation-reminders] No pending reminders found');
        return apiResponse.ok({
          errors: [],
          errorCount: 0,
          message: 'No pending reminders to process',
          sentCount: 0,
          skippedCount: 0,
        });
      }

      console.log(
        `[process-invitation-reminders] Found ${completedReminders.length} pending reminders`
      );

      // 2. Process each reminder
      for (const reminder of completedReminders) {
        try {
          // Fetch profile info
          const { data: profile, error: profileError } =
            await supabaseAdminClient
              .from('profiles')
              .select('email, first_name, invitation_status, is_onboarded')
              .eq('user_id', reminder.profile_id)
              .single();

          if (profileError || !profile) {
            console.error(
              `[process-invitation-reminders] Profile not found for ${reminder.profile_id}:`,
              profileError?.message
            );
            // Mark as sent to avoid retrying
            await supabaseAdminClient
              .from('invitation_reminders')
              .update({ sent_at: new Date().toISOString() })
              .eq('id', reminder.id);
            skippedCount++;
            continue;
          }

          // If user already completed onboarding, skip and mark as sent
          if (
            profile.invitation_status === 'completed' ||
            profile.is_onboarded === true
          ) {
            console.log(
              `[process-invitation-reminders] Skipping ${profile.email} - already completed`
            );
            await supabaseAdminClient
              .from('invitation_reminders')
              .update({ sent_at: new Date().toISOString() })
              .eq('id', reminder.id);
            skippedCount++;
            continue;
          }

          // Fetch reminder details (type)
          const { data: reminderDetails } = await supabaseAdminClient
            .from('invitation_reminders')
            .select('reminder_type')
            .eq('id', reminder.id)
            .single();

          const reminderType = reminderDetails?.reminder_type || 'j3';

          // Generate a new recovery link
          const { data: linkData, error: linkError } =
            await supabaseAdminClient.auth.admin.generateLink({
              email: profile.email,
              options: {
                redirectTo: `${appUrl}/fr/auth/callback?next=/fr/professional/onboarding`,
              },
              type: 'recovery',
            });

          if (linkError || !linkData?.properties?.action_link) {
            console.error(
              `[process-invitation-reminders] Failed to generate link for ${profile.email}:`,
              linkError?.message
            );
            errorCount++;
            errors.push({
              email: profile.email,
              error: linkError?.message || 'Failed to generate recovery link',
            });
            continue;
          }

          const resetLink = linkData.properties.action_link;
          const subject =
            REMINDER_SUBJECTS[reminderType] || 'Rappel ProKid';

          // Send email
          const { error: emailError } = await resend.emails.send({
            from: fromEmail,
            html: buildReminderEmailHtml({
              appUrl,
              firstName: profile.first_name,
              reminderType,
              resetLink,
            }),
            subject,
            to: profile.email,
          });

          if (emailError) {
            console.error(
              `[process-invitation-reminders] Email error for ${profile.email}:`,
              emailError
            );
            errorCount++;
            errors.push({
              email: profile.email,
              error: emailError.message || 'Resend error',
            });
            continue;
          }

          // Mark as sent
          await supabaseAdminClient
            .from('invitation_reminders')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', reminder.id);

          sentCount++;
          console.log(
            `[process-invitation-reminders] Sent ${reminderType} reminder to ${profile.email}`
          );
        } catch (error) {
          console.error(
            `[process-invitation-reminders] Error processing reminder ${reminder.id}:`,
            error
          );
          errorCount++;
          errors.push({
            email: `reminder-${reminder.id}`,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      console.log(
        `[process-invitation-reminders] Done: ${sentCount} sent, ${skippedCount} skipped, ${errorCount} errors`
      );

      return apiResponse.ok({
        errors,
        errorCount,
        message: `Processed ${completedReminders.length} reminders`,
        sentCount,
        skippedCount,
      });
    } catch (error) {
      console.error('[process-invitation-reminders] Fatal error:', error);
      return apiResponse.internalServerError(
        'Failed to process invitation reminders',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }
);
