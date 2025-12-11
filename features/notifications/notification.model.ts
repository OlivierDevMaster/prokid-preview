import { createEnumConstants } from '@/lib/utils/enums';
import {
  Constants,
  type Enums,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from '@/types/database/schema';

export type NotificationType = Enums<'notification_type'>;

export const NotificationType = createEnumConstants(
  Constants.public.Enums.notification_type
);

export const NotificationTypes = Constants.public.Enums.notification_type;

export interface InvitationAcceptedNotificationData {
  invitation_id: string;
  professional_id: string;
  professional_name: string;
}

export interface InvitationDeclinedNotificationData {
  invitation_id: string;
  professional_id: string;
  professional_name: string;
}

// Notification data interfaces for each type
export interface InvitationReceivedNotificationData {
  invitation_id: string;
  structure_id: string;
  structure_name: string;
}

export interface MemberFiredNotificationData {
  professional_id: string;
  professional_name: string;
  structure_id: string;
}

export interface MemberQuitNotificationData {
  professional_id: string;
  professional_name: string;
  structure_id: string;
}

export interface MissionAcceptedNotificationData {
  mission_id: string;
  mission_title: string;
  professional_id: string;
  professional_name: string;
}

export interface MissionCancelledNotificationData {
  mission_id: string;
  mission_title: string;
  structure_id: string;
  structure_name: string;
}

export interface MissionDeclinedNotificationData {
  mission_id: string;
  mission_title: string;
  professional_id: string;
  professional_name: string;
}

export interface MissionReceivedNotificationData {
  mission_id: string;
  mission_title: string;
  structure_id: string;
  structure_name: string;
}

// Extended notification type with typed data field
export interface Notification extends Omit<NotificationRow, 'data'> {
  data: NotificationData;
}

// Discriminated union type for notification data
export type NotificationData =
  | ({
      type: 'invitation_accepted';
    } & InvitationAcceptedNotificationData)
  | ({
      type: 'invitation_declined';
    } & InvitationDeclinedNotificationData)
  | ({
      type: 'invitation_received';
    } & InvitationReceivedNotificationData)
  | ({
      type: 'member_fired';
    } & MemberFiredNotificationData)
  | ({
      type: 'member_quit';
    } & MemberQuitNotificationData)
  | ({
      type: 'mission_accepted';
    } & MissionAcceptedNotificationData)
  | ({
      type: 'mission_cancelled';
    } & MissionCancelledNotificationData)
  | ({
      type: 'mission_declined';
    } & MissionDeclinedNotificationData)
  | ({
      type: 'mission_received';
    } & MissionReceivedNotificationData)
  | ({
      type: 'report_sent';
    } & ReportSentNotificationData);

export interface NotificationFilters {
  read?: boolean;
  recipient_id?: string;
  type?: NotificationType;
}

export type NotificationInsert = TablesInsert<'notifications'>;

// Base notification type from database
export type NotificationRow = Tables<'notifications'>;

export type NotificationUpdate = TablesUpdate<'notifications'>;

export interface ReportSentNotificationData {
  mission_id: string;
  professional_id: string;
  professional_name: string;
  report_id: string;
  report_title: string;
}
