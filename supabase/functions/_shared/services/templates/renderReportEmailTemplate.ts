import { formatDate } from '../../utils/dateFormatters.ts';
import { renderEmailTemplate } from './renderEmailTemplate.ts';

/**
 * Renders the report email template with all partials
 * Accepts raw data and handles all formatting internally
 * Returns minified HTML
 */
export async function renderReportEmailTemplate(data: {
  attachments: Array<{
    file_name: string;
    file_size: number;
  }>;
  createdAt: Date | string;
  locale?: 'en' | 'fr';
  mission: {
    description: null | string;
    mission_dtstart: Date | string;
    mission_until: Date | string;
    title: string;
  };
  professional: {
    email: string;
    firstName: null | string;
    lastName: null | string;
  };
  report: {
    content: string;
    title: string;
  };
  structure: {
    name: string;
  };
}): Promise<string> {
  const {
    attachments,
    createdAt,
    locale = 'fr',
    mission,
    professional,
    report,
    structure,
  } = data;

  const professionalName =
    professional.firstName && professional.lastName
      ? `${professional.firstName} ${professional.lastName}`
      : professional.firstName || professional.lastName || 'Professional';

  const formattedAttachments = attachments.map(att => ({
    file_name: att.file_name,
    file_size_kb: (att.file_size / 1024).toFixed(2),
  }));

  const created_at = formatDate(createdAt, locale);
  const mission_start_date = formatDate(mission.mission_dtstart, locale);
  const mission_end_date = formatDate(mission.mission_until, locale);

  const footerText =
    locale === 'fr'
      ? `Rapport créé le: ${created_at} | Structure: ${structure.name}`
      : `Report created on: ${created_at} | Structure: ${structure.name}`;

  const templateData = {
    attachments: formattedAttachments,
    attachments_count: attachments.length,
    created_at,
    footer_text: footerText,
    has_attachments: attachments.length > 0,
    mission_description: mission.description,
    mission_end_date,
    mission_start_date,
    mission_title: mission.title,
    professional_email: professional.email,
    professional_name: professionalName,
    report_content: report.content,
    structure_name: structure.name,
    title: report.title,
  };

  return await renderEmailTemplate('report', templateData, locale);
}
