import Mustache from 'mustache';

import {
  footerTemplateEn,
  footerTemplateFr,
  headerTemplateEn,
  headerTemplateFr,
} from '../../templates/emails/index.ts';
import { layoutTemplate } from '../../templates/emails/layout.ts';
import {
  notificationBodyTemplateEn,
  notificationBodyTemplateFr,
} from '../../templates/emails/notification/index.ts';
import { minifyHtml } from '../../utils/htmlMinifier.ts';
import { sanitizeHtml, sanitizeText } from '../../utils/htmlSanitizer.ts';

interface NotificationEmailData {
  appUrl: string;
  locale: 'en' | 'fr';
  notification: {
    data: Record<string, unknown>;
    id: string;
    recipient_id: string;
    recipient_role: 'professional' | 'structure';
    type: NotificationType;
  };
  translations: {
    description: string;
    title: string;
  };
}

type NotificationType =
  | 'invitation_accepted'
  | 'invitation_declined'
  | 'invitation_received'
  | 'member_fired'
  | 'member_quit'
  | 'mission_accepted'
  | 'mission_cancelled'
  | 'mission_declined'
  | 'mission_ended'
  | 'mission_expired'
  | 'mission_received'
  | 'report_sent';

/**
 * Renders a notification email template
 * @param data - Notification data and translations
 * @returns Minified HTML string
 */
export async function renderNotificationEmailTemplate(
  data: NotificationEmailData
): Promise<string> {
  const { appUrl, locale, notification, translations } = data;

  const body =
    locale === 'en' ? notificationBodyTemplateEn : notificationBodyTemplateFr;
  const header = locale === 'en' ? headerTemplateEn : headerTemplateFr;
  const footer = locale === 'en' ? footerTemplateEn : footerTemplateFr;
  const layout = layoutTemplate;

  // Extract details from notification data
  const notificationData = notification.data;
  const missionTitle = (notificationData.mission_title as string) || undefined;
  const reportTitle = (notificationData.report_title as string) || undefined;
  const structureName =
    (notificationData.structure_name as string) || undefined;
  const professionalName =
    (notificationData.professional_name as string) || undefined;

  const hasDetails =
    !!missionTitle || !!reportTitle || !!structureName || !!professionalName;

  // Use view_chat_url from data when present (e.g. mission_received → chat), else notifications page
  const viewChatUrl = notificationData.view_chat_url as string | undefined;
  const viewNotificationUrl =
    viewChatUrl ?? `${appUrl}/${locale}/notifications/${notification.id}`;

  // Prepare template data
  const templateData: Record<string, unknown> = {
    footer_text:
      locale === 'fr'
        ? 'Vous recevez cet email car vous avez activé les notifications par email dans vos préférences.'
        : 'You are receiving this email because you have enabled email notifications in your preferences.',
    has_details: hasDetails,
    mission_title: missionTitle,
    notification_description: translations.description,
    professional_name: professionalName,
    report_title: reportTitle,
    structure_name: structureName,
    title: translations.title,
    view_notification_url: viewNotificationUrl,
  };

  // Sanitize string values
  const sanitizedData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(templateData)) {
    if (typeof value === 'string') {
      if (key.includes('description') || key.includes('content')) {
        sanitizedData[key] = sanitizeHtml(value);
      } else {
        sanitizedData[key] = sanitizeText(value);
      }
    } else {
      sanitizedData[key] = value;
    }
  }

  // Render body with Mustache
  const bodyRendered = Mustache.render(body, sanitizedData);
  sanitizedData.body = bodyRendered;

  // Prepare partials
  const partials: Record<string, string> = {
    body: bodyRendered,
    footer,
    header,
  };

  // Render full layout
  const html = Mustache.render(layout, sanitizedData, partials);

  return await minifyHtml(html);
}
