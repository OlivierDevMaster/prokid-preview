import Mustache from 'mustache';

import { footerTemplate } from '../templates/emails/footer.ts';
import { headerTemplate } from '../templates/emails/header.ts';
import { layoutTemplate } from '../templates/emails/layout.ts';
import { reportBodyTemplate } from '../templates/emails/report/body.ts';
import { sanitizeHtml, sanitizeText } from './htmlSanitizer.ts';

/**
 * Renders an email using the shared layout with a specific body template
 * @param emailType - Type of email (e.g., 'report')
 * @param data - Data object to render in the template
 * @returns Rendered HTML string
 */
export function renderEmailTemplate(
  emailType: string,
  data: Record<string, unknown>
): string {
  // Get body template based on email type
  let body: string;
  if (emailType === 'report') {
    body = reportBodyTemplate;
  } else {
    throw new Error(`Unknown email type: ${emailType}`);
  }

  const header = headerTemplate;
  const footer = footerTemplate;
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

  return Mustache.render(layout, sanitizedData, partials);
}

/**
 * Renders the report email template with all partials
 */
export function renderReportEmailTemplate(data: {
  attachments: Array<{
    file_name: string;
    file_size_kb: string;
  }>;
  attachments_count: number;
  created_at: string;
  footer_text: string;
  has_attachments: boolean;
  mission_description: null | string;
  mission_end_date: string;
  mission_start_date: string;
  mission_title: string;
  professional_email: string;
  professional_name: string;
  report_content: string;
  structure_name: string;
  title: string;
}): string {
  return renderEmailTemplate('report', data);
}
