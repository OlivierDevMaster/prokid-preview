import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

import { SendNotificationEmailRequestBodySchema } from '../../_shared/features/notifications/notification.schemas.ts';
import { renderNotificationEmailTemplate } from '../../_shared/services/templates/renderNotificationEmailTemplate.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

const factory = createFactory();

type NotificationType = Database['public']['Enums']['notification_type'];

// Translation maps for notification titles and descriptions
const notificationTranslations: Record<
  NotificationType,
  {
    en: {
      description: (data: Record<string, unknown>) => string;
      title: (data: Record<string, unknown>) => string;
    };
    fr: {
      description: (data: Record<string, unknown>) => string;
      title: (data: Record<string, unknown>) => string;
    };
  }
> = {
  invitation_accepted: {
    en: {
      description: data =>
        `${data.professional_name as string} has accepted your invitation`,
      title: data =>
        `Invitation accepted by ${data.professional_name as string}`,
    },
    fr: {
      description: data =>
        `${data.professional_name as string} a accepté votre invitation`,
      title: data =>
        `Invitation acceptée par ${data.professional_name as string}`,
    },
  },
  invitation_declined: {
    en: {
      description: data =>
        `${data.professional_name as string} has declined your invitation`,
      title: data =>
        `Invitation declined by ${data.professional_name as string}`,
    },
    fr: {
      description: data =>
        `${data.professional_name as string} a refusé votre invitation`,
      title: data =>
        `Invitation refusée par ${data.professional_name as string}`,
    },
  },
  invitation_received: {
    en: {
      description: data =>
        `You have been invited to join ${data.structure_name as string}`,
      title: () => 'New Invitation',
    },
    fr: {
      description: data =>
        `Vous avez été invité à rejoindre ${data.structure_name as string}`,
      title: () => 'Nouvelle invitation',
    },
  },
  member_fired: {
    en: {
      description: () => 'You have been removed from the structure',
      title: () => 'You have been removed from the structure',
    },
    fr: {
      description: () => 'Vous avez été retiré de la structure',
      title: () => 'Vous avez été retiré de la structure',
    },
  },
  member_quit: {
    en: {
      description: data =>
        `${data.professional_name as string} has left your structure`,
      title: data => `${data.professional_name as string} left the structure`,
    },
    fr: {
      description: data =>
        `${data.professional_name as string} a quitté votre structure`,
      title: data =>
        `${data.professional_name as string} a quitté la structure`,
    },
  },
  mission_accepted: {
    en: {
      description: data =>
        `${data.professional_name as string} has accepted the mission: ${data.mission_title as string}`,
      title: data => `Mission accepted: ${data.mission_title as string}`,
    },
    fr: {
      description: data =>
        `${data.professional_name as string} a accepté la mission : ${data.mission_title as string}`,
      title: data => `Mission acceptée : ${data.mission_title as string}`,
    },
  },
  mission_cancelled: {
    en: {
      description: data =>
        `The mission "${data.mission_title as string}" has been cancelled`,
      title: data => `Mission cancelled: ${data.mission_title as string}`,
    },
    fr: {
      description: data =>
        `La mission "${data.mission_title as string}" a été annulée`,
      title: data => `Mission annulée : ${data.mission_title as string}`,
    },
  },
  mission_declined: {
    en: {
      description: data =>
        `${data.professional_name as string} has declined the mission: ${data.mission_title as string}`,
      title: data => `Mission declined: ${data.mission_title as string}`,
    },
    fr: {
      description: data =>
        `${data.professional_name as string} a refusé la mission : ${data.mission_title as string}`,
      title: data => `Mission refusée : ${data.mission_title as string}`,
    },
  },
  mission_ended: {
    en: {
      description: data => {
        if (data.structure_name) {
          return `The mission "${data.mission_title as string}" from ${data.structure_name as string} has ended`;
        }
        return `The mission "${data.mission_title as string}" with ${data.professional_name as string} has ended`;
      },
      title: data => `Mission ended: ${data.mission_title as string}`,
    },
    fr: {
      description: data => {
        if (data.structure_name) {
          return `La mission "${data.mission_title as string}" de ${data.structure_name as string} s'est terminée`;
        }
        return `La mission "${data.mission_title as string}" avec ${data.professional_name as string} s'est terminée`;
      },
      title: data => `Mission terminée : ${data.mission_title as string}`,
    },
  },
  mission_expired: {
    en: {
      description: data => {
        if (data.structure_name) {
          return `The mission "${data.mission_title as string}" from ${data.structure_name as string} has expired`;
        }
        return `The mission "${data.mission_title as string}" with ${data.professional_name as string} has expired`;
      },
      title: data => `Mission expired: ${data.mission_title as string}`,
    },
    fr: {
      description: data => {
        if (data.structure_name) {
          return `La mission "${data.mission_title as string}" de ${data.structure_name as string} a expiré`;
        }
        return `La mission "${data.mission_title as string}" avec ${data.professional_name as string} a expiré`;
      },
      title: data => `Mission expirée : ${data.mission_title as string}`,
    },
  },
  mission_received: {
    en: {
      description: data =>
        `You have received a new mission: ${data.mission_title as string}`,
      title: data => `New mission: ${data.mission_title as string}`,
    },
    fr: {
      description: data =>
        `Vous avez reçu une nouvelle mission : ${data.mission_title as string}`,
      title: data => `Nouvelle mission : ${data.mission_title as string}`,
    },
  },
  report_sent: {
    en: {
      description: data =>
        `${data.professional_name as string} has sent the report: ${data.report_title as string}`,
      title: data => `Report sent: ${data.report_title as string}`,
    },
    fr: {
      description: data =>
        `${data.professional_name as string} a envoyé le rapport : ${data.report_title as string}`,
      title: data => `Rapport envoyé : ${data.report_title as string}`,
    },
  },
};

export const sendNotificationEmailHandler = factory.createHandlers(
  async ({ req }) => {
    let notification_id: string | undefined;
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
        SendNotificationEmailRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const { notification_id } = validationResult.data;

      // Fetch notification
      const { data: notification, error: notificationError } =
        await supabaseAdminClient
          .from('notifications')
          .select('*')
          .eq('id', notification_id)
          .single();

      if (notificationError || !notification) {
        console.error(
          '[send-notification-email] Notification not found:',
          notificationError
        );
        return apiResponse.notFound('Notification not found');
      }

      // Get recipient profile (email and locale)
      const { data: recipientProfile, error: profileError } =
        await supabaseAdminClient
          .from('profiles')
          .select('email, preferred_language')
          .eq('user_id', notification.recipient_id)
          .single();

      if (profileError || !recipientProfile) {
        console.error(
          '[send-notification-email] Recipient profile not found:',
          profileError
        );
        return apiResponse.notFound('Recipient profile not found');
      }

      const locale =
        (recipientProfile.preferred_language as 'en' | 'fr') || 'fr';

      // Check email notification preferences
      let emailNotificationsEnabled = true;

      if (notification.recipient_role === 'professional') {
        const { data: preferences } = await supabaseAdminClient
          .from('professional_notification_preferences')
          .select('email_notifications')
          .eq('user_id', notification.recipient_id)
          .single();

        emailNotificationsEnabled = preferences?.email_notifications ?? true;
      } else if (notification.recipient_role === 'structure') {
        const { data: preferences } = await supabaseAdminClient
          .from('structure_notification_preferences')
          .select('email_notifications')
          .eq('user_id', notification.recipient_id)
          .single();

        emailNotificationsEnabled = preferences?.email_notifications ?? true;
      }

      if (!emailNotificationsEnabled) {
        return apiResponse.ok({
          message: 'Email notifications disabled',
          notification_id,
          sent: false,
        });
      }

      // Get translations
      const translations = notificationTranslations[notification.type];
      if (!translations) {
        console.error(
          '[send-notification-email] Unknown notification type:',
          notification.type
        );
        return apiResponse.badRequest(
          'UNKNOWN_NOTIFICATION_TYPE',
          'Unknown notification type'
        );
      }

      const localeTranslations = translations[locale];

      // Parse notification data safely
      let notificationData: Record<string, unknown>;
      try {
        notificationData =
          typeof notification.data === 'string'
            ? JSON.parse(notification.data)
            : notification.data;
      } catch (parseError) {
        console.error(
          '[send-notification-email] Failed to parse notification data:',
          {
            data: notification.data,
            error:
              parseError instanceof Error
                ? parseError.message
                : 'Unknown parse error',
            notification_id,
          }
        );
        return apiResponse.badRequest(
          'INVALID_NOTIFICATION_DATA',
          'Failed to parse notification data'
        );
      }

      // Generate translations safely
      let title: string;
      let description: string;
      try {
        title = localeTranslations.title(notificationData);
        description = localeTranslations.description(notificationData);
      } catch (translationError) {
        console.error(
          '[send-notification-email] Failed to generate translations:',
          {
            error:
              translationError instanceof Error
                ? translationError.message
                : 'Unknown translation error',
            locale,
            notification_data: notificationData,
            notification_id,
            notification_type: notification.type,
          }
        );
        return apiResponse.internalServerError(
          'Failed to generate notification translations',
          {
            error:
              translationError instanceof Error
                ? translationError.message
                : 'Unknown error',
            notification_type: notification.type,
          }
        );
      }

      // Get app URL from environment (set in Supabase Functions secrets)
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

      // Render email template
      let emailHtml: string;
      try {
        emailHtml = await renderNotificationEmailTemplate({
          appUrl,
          locale,
          notification: {
            data: notificationData,
            id: notification.id,
            recipient_id: notification.recipient_id,
            recipient_role: notification.recipient_role as
              | 'professional'
              | 'structure',
            type: notification.type as NotificationType,
          },
          translations: {
            description,
            title,
          },
        });
      } catch (templateError) {
        console.error(
          '[send-notification-email] Failed to render email template:',
          {
            error:
              templateError instanceof Error
                ? templateError.message
                : 'Unknown template error',
            locale,
            notification_id,
            notification_type: notification.type,
            stack:
              templateError instanceof Error ? templateError.stack : undefined,
          }
        );
        return apiResponse.internalServerError(
          'Failed to render email template',
          {
            error:
              templateError instanceof Error
                ? templateError.message
                : 'Unknown error',
          }
        );
      }

      // Send email via Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        console.error(
          '[send-notification-email] RESEND_API_KEY not configured'
        );
        return apiResponse.internalServerError(
          'Email service is not configured'
        );
      }

      const resend = new Resend(resendApiKey);
      const fromEmail = Deno.env.get('NOREPLY_EMAIL');

      if (!fromEmail) {
        console.error('[send-notification-email] NOREPLY_EMAIL not configured');
        return apiResponse.internalServerError(
          'Email service is not configured'
        );
      }

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: fromEmail,
        html: emailHtml,
        subject: title,
        to: recipientProfile.email,
      });

      if (emailError) {
        console.error(
          '[send-notification-email] Error sending email:',
          emailError
        );
        return apiResponse.internalServerError('Failed to send email', {
          error: emailError.message || 'Unknown error',
        });
      }

      return apiResponse.ok({
        emailId: emailData?.id,
        message: 'Email notification sent successfully',
        notification_id,
        sent: true,
      });
    } catch (error) {
      console.error('[send-notification-email] Fatal error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        notification_id: notification_id || 'unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return apiResponse.internalServerError(
        'Failed to send notification email',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
    }
  }
);
