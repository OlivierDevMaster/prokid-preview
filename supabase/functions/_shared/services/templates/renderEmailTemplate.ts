import Mustache from 'mustache';

import {
  appointmentReminderBodyTemplateEn,
  appointmentReminderBodyTemplateFr,
} from '../../templates/emails/appointment-reminder/index.ts';
import {
  footerTemplateEn,
  footerTemplateFr,
  headerTemplateEn,
  headerTemplateFr,
} from '../../templates/emails/index.ts';
import { layoutTemplate } from '../../templates/emails/layout.ts';
import {
  reportBodyTemplateEn,
  reportBodyTemplateFr,
} from '../../templates/emails/report/index.ts';
import { minifyHtml } from '../../utils/htmlMinifier.ts';
import { sanitizeHtml, sanitizeText } from '../../utils/htmlSanitizer.ts';

/**
 * Renders an email using the shared layout with a specific body template
 * @param emailType - Type of email (e.g., 'report')
 * @param data - Data object to render in the template
 * @param locale - Locale for template selection ('en' | 'fr'), defaults to 'fr'
 * @returns Minified HTML string
 */
export async function renderEmailTemplate(
  emailType: string,
  data: Record<string, unknown>,
  locale: 'en' | 'fr' = 'fr'
): Promise<string> {
  // Get body template based on email type and locale
  let body: string;
  if (emailType === 'report') {
    body = locale === 'en' ? reportBodyTemplateEn : reportBodyTemplateFr;
  } else if (emailType === 'appointment-reminder') {
    body =
      locale === 'en'
        ? appointmentReminderBodyTemplateEn
        : appointmentReminderBodyTemplateFr;
  } else {
    throw new Error(`Unknown email type: ${emailType}`);
  }

  const header = locale === 'en' ? headerTemplateEn : headerTemplateFr;
  const footer = locale === 'en' ? footerTemplateEn : footerTemplateFr;
  const layout = layoutTemplate;

  const sanitizedData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      if (
        key.includes('content') ||
        key.includes('html') ||
        key.includes('body')
      ) {
        sanitizedData[key] = sanitizeHtml(value);
      } else {
        sanitizedData[key] = sanitizeText(value);
      }
    } else {
      sanitizedData[key] = value;
    }
  }

  const bodyRendered = Mustache.render(body, sanitizedData);
  sanitizedData.body = bodyRendered;

  const partials: Record<string, string> = {
    body: bodyRendered,
    footer,
    header,
  };

  const html = Mustache.render(layout, sanitizedData, partials);

  return await minifyHtml(html);
}
