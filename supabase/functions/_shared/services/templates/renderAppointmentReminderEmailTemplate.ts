import { format } from 'npm:date-fns@^4.1.0';
import { fr } from 'npm:date-fns@^4.1.0/locale/fr';

import { formatDateTime, formatDuration } from '../../utils/dateFormatters.ts';
import { renderEmailTemplate } from './renderEmailTemplate.ts';

/**
 * Renders the appointment reminder email template with all partials
 * Accepts raw data and handles all formatting internally
 * Returns minified HTML
 */
export async function renderAppointmentReminderEmailTemplate(data: {
  durationMinutes: number;
  locale: 'en' | 'fr';
  mission: {
    description: null | string;
    title: string;
  };
  occurrenceDate: Date;
  professional: {
    email: string;
    firstName: null | string;
    lastName: null | string;
  };
  sentAt: Date;
  structure: {
    email: null | string;
    name: string;
  } | null;
}): Promise<string> {
  const {
    durationMinutes,
    locale,
    mission,
    occurrenceDate,
    professional,
    sentAt,
    structure,
  } = data;

  const appointmentDateTime = formatDateTime(occurrenceDate, locale);
  const appointmentDuration = formatDuration(durationMinutes, locale);

  const professionalName =
    professional.firstName && professional.lastName
      ? `${professional.firstName} ${professional.lastName}`
      : professional.firstName || professional.lastName || 'Professional';

  const footerText =
    locale === 'fr'
      ? `Rappel envoyé le: ${format(sentAt, 'dd/MM/yyyy à HH:mm', { locale: fr })} | Mission: ${mission.title}`
      : `Reminder sent on: ${format(sentAt, 'MM/dd/yyyy at HH:mm')} | Mission: ${mission.title}`;

  const title =
    locale === 'fr' ? 'Rappel de rendez-vous' : 'Appointment Reminder';

  const templateData = {
    appointment_date_time: appointmentDateTime,
    appointment_duration: appointmentDuration,
    footer_text: footerText,
    mission_description: mission.description || '',
    mission_title: mission.title,
    professional_email: professional.email,
    professional_name: professionalName,
    structure_email: structure?.email || '',
    structure_name: structure?.name || 'Structure',
    title,
  };

  return await renderEmailTemplate(
    'appointment-reminder',
    templateData,
    locale
  );
}
