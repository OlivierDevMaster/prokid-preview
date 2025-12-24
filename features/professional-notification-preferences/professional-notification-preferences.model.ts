import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export type ProfessionalNotificationPreferences =
  Tables<'professional_notification_preferences'>;

export type ProfessionalNotificationPreferencesInsert =
  TablesInsert<'professional_notification_preferences'>;

export type ProfessionalNotificationPreferencesUpdate =
  TablesUpdate<'professional_notification_preferences'>;
