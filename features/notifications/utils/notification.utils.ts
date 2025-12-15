import { format } from 'date-fns';

import type { Notification } from '../notification.model';

export const getNotificationTitle = (notification: Notification): string => {
  const { data, type } = notification;

  switch (type) {
    case 'invitation_accepted':
      return `Invitation accepted by ${(data as { professional_name: string }).professional_name}`;
    case 'invitation_declined':
      return `Invitation declined by ${(data as { professional_name: string }).professional_name}`;
    case 'invitation_received':
      return `Invitation from ${(data as { structure_name: string }).structure_name}`;
    case 'member_fired':
      return `${(data as { professional_name: string }).professional_name} was removed from the structure`;
    case 'member_quit':
      return `${(data as { professional_name: string }).professional_name} left the structure`;
    case 'mission_accepted':
      return `Mission accepted: ${(data as { mission_title: string }).mission_title}`;
    case 'mission_cancelled':
      return `Mission cancelled: ${(data as { mission_title: string }).mission_title}`;
    case 'mission_declined':
      return `Mission declined: ${(data as { mission_title: string }).mission_title}`;
    case 'mission_received':
      return `New mission: ${(data as { mission_title: string }).mission_title}`;
    case 'report_sent':
      return `Report received: ${(data as { report_title: string }).report_title}`;
    default:
      return 'Notification';
  }
};

export const getNotificationDescription = (
  notification: Notification
): string => {
  const { data, type } = notification;

  switch (type) {
    case 'invitation_accepted':
      return `${(data as { professional_name: string }).professional_name} has accepted your invitation`;
    case 'invitation_declined':
      return `${(data as { professional_name: string }).professional_name} has declined your invitation`;
    case 'invitation_received':
      return `You have been invited to join ${(data as { structure_name: string }).structure_name}`;
    case 'member_fired':
      return `${(data as { professional_name: string }).professional_name} has been removed from your structure`;
    case 'member_quit':
      return `${(data as { professional_name: string }).professional_name} has left your structure`;
    case 'mission_accepted':
      return `${(data as { professional_name: string }).professional_name} has accepted the mission: ${(data as { mission_title: string }).mission_title}`;
    case 'mission_cancelled':
      return `The mission "${(data as { mission_title: string }).mission_title}" has been cancelled`;
    case 'mission_declined':
      return `${(data as { professional_name: string }).professional_name} has declined the mission: ${(data as { mission_title: string }).mission_title}`;
    case 'mission_received':
      return `You have received a new mission: ${(data as { mission_title: string }).mission_title}`;
    case 'report_sent':
      return `You have received a report: ${(data as { report_title: string }).report_title} from ${(data as { professional_name: string }).professional_name}`;
    default:
      return 'You have a new notification';
  }
};

export const getNotificationSender = (notification: Notification): string => {
  const { data, type } = notification;

  switch (type) {
    case 'invitation_accepted':
    case 'invitation_declined':
    case 'member_quit':
    case 'mission_accepted':
    case 'mission_declined':
    case 'report_sent':
      return (data as { professional_name: string }).professional_name;
    case 'invitation_received':
      return (data as { structure_name: string }).structure_name;
    case 'member_fired':
    case 'mission_cancelled':
    case 'mission_received':
      return (data as { structure_name: string }).structure_name;
    default:
      return 'System';
  }
};

export const formatNotificationDate = (date: string): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const canAcceptOrDecline = (notification: Notification): boolean => {
  return (
    notification.type === 'invitation_received' ||
    notification.type === 'mission_received'
  );
};
