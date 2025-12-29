import { format } from 'npm:date-fns@^4.1.0';
import { fr } from 'npm:date-fns@^4.1.0/locale/fr';

/**
 * Formats a date string to a readable format in the specified locale
 */
export function formatDate(
  date: Date | string,
  locale: 'en' | 'fr' = 'fr'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locale === 'fr' ? fr : undefined;

  if (locale === 'fr') {
    return format(dateObj, 'dd/MM/yyyy à HH:mm', { locale: localeObj });
  } else {
    return format(dateObj, 'MM/dd/yyyy at HH:mm', { locale: localeObj });
  }
}

/**
 * Formats date and time in the specified locale
 */
export function formatDateTime(date: Date, locale: 'en' | 'fr' = 'fr'): string {
  const localeObj = locale === 'fr' ? fr : undefined;
  return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: localeObj });
}

/**
 * Formats duration in minutes to a readable string
 */
export function formatDuration(
  minutes: number,
  locale: 'en' | 'fr' = 'fr'
): string {
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
