import { createClient } from '@/lib/supabase/client';

import type {
  ProfessionalNotificationPreferences,
  ProfessionalNotificationPreferencesUpdate,
} from '../professional-notification-preferences.model';

export async function getProfessionalNotificationPreferences(
  userId: string
): Promise<null | ProfessionalNotificationPreferences> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professional_notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function updateProfessionalNotificationPreferences(
  userId: string,
  preferences: ProfessionalNotificationPreferencesUpdate
): Promise<ProfessionalNotificationPreferences> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professional_notification_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
