import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatMessageDate(
  dateStr: string,
  t: (k: string) => string
): string {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d >= today) return t('today');
  if (d >= yesterday) return t('yesterday');
  return format(d, 'EEEE d MMM. yyyy', { locale: fr });
}
