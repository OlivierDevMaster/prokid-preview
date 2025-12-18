import { format } from 'date-fns';

import type { Notification } from '../notification.model';

type TranslationFunction = (
  key: string,
  values?: Record<string, number | string>
) => string;

export const getNotificationTitle = (
  notification: Notification,
  t: TranslationFunction
): string => {
  const { data, type } = notification;

  switch (type) {
    case 'invitation_accepted':
      return t('titles.invitation_accepted', {
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'invitation_declined':
      return t('titles.invitation_declined', {
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'invitation_received':
      return t('titles.invitation_received', {
        structure_name: (data as { structure_name: string }).structure_name,
      });
    case 'member_fired':
      return t('titles.member_fired', {
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'member_quit':
      return t('titles.member_quit', {
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'mission_accepted':
      return t('titles.mission_accepted', {
        mission_title: (data as { mission_title: string }).mission_title,
      });
    case 'mission_cancelled':
      return t('titles.mission_cancelled', {
        mission_title: (data as { mission_title: string }).mission_title,
      });
    case 'mission_declined':
      return t('titles.mission_declined', {
        mission_title: (data as { mission_title: string }).mission_title,
      });
    case 'mission_ended':
      return t('titles.mission_ended', {
        mission_title: (data as { mission_title: string }).mission_title,
      });
    case 'mission_expired':
      return t('titles.mission_expired', {
        mission_title: (data as { mission_title: string }).mission_title,
      });
    case 'mission_received':
      return t('titles.mission_received', {
        mission_title: (data as { mission_title: string }).mission_title,
      });
    case 'report_sent':
      return t('titles.report_sent', {
        report_title: (data as { report_title: string }).report_title,
      });
    default:
      return t('titles.default');
  }
};

export const getNotificationDescription = (
  notification: Notification,
  t: TranslationFunction
): string => {
  const { data, type } = notification;

  switch (type) {
    case 'invitation_accepted':
      return t('descriptions.invitation_accepted', {
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'invitation_declined':
      return t('descriptions.invitation_declined', {
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'invitation_received':
      return t('descriptions.invitation_received', {
        structure_name: (data as { structure_name: string }).structure_name,
      });
    case 'member_fired':
      return t('descriptions.member_fired', {
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'member_quit':
      return t('descriptions.member_quit', {
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'mission_accepted':
      return t('descriptions.mission_accepted', {
        mission_title: (data as { mission_title: string }).mission_title,
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'mission_cancelled':
      return t('descriptions.mission_cancelled', {
        mission_title: (data as { mission_title: string }).mission_title,
      });
    case 'mission_declined':
      return t('descriptions.mission_declined', {
        mission_title: (data as { mission_title: string }).mission_title,
        professional_name: (data as { professional_name: string })
          .professional_name,
      });
    case 'mission_expired':
      // Check if recipient is professional or structure based on available data
      if ((data as { structure_name?: string }).structure_name) {
        // Professional notification
        return t('descriptions.mission_expired_professional', {
          mission_title: (data as { mission_title: string }).mission_title,
          structure_name: (data as { structure_name: string }).structure_name,
        });
      } else {
        // Structure notification
        return t('descriptions.mission_expired_structure', {
          mission_title: (data as { mission_title: string }).mission_title,
          professional_name: (data as { professional_name: string })
            .professional_name,
        });
      }
    case 'mission_ended':
      // Check if recipient is professional or structure based on available data
      if ((data as { structure_name?: string }).structure_name) {
        // Professional notification
        return t('descriptions.mission_ended_professional', {
          mission_title: (data as { mission_title: string }).mission_title,
          structure_name: (data as { structure_name: string }).structure_name,
        });
      } else {
        // Structure notification
        return t('descriptions.mission_ended_structure', {
          mission_title: (data as { mission_title: string }).mission_title,
          professional_name: (data as { professional_name: string })
            .professional_name,
        });
      }
    case 'report_sent':
      return t('descriptions.report_sent', {
        professional_name: (data as { professional_name: string })
          .professional_name,
        report_title: (data as { report_title: string }).report_title,
      });
    case 'mission_received':
      return t('descriptions.mission_received', {
        mission_title: (data as { mission_title: string }).mission_title,
      });
    default:
      return t('descriptions.default');
  }
};

export const getNotificationSender = (
  notification: Notification,
  t: TranslationFunction
): string => {
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
    case 'mission_ended':
    case 'mission_expired':
    case 'mission_received':
      // For mission_expired and mission_ended, check if structure_name exists (professional notification) or professional_name (structure notification)
      if ((data as { structure_name?: string }).structure_name) {
        return (data as { structure_name: string }).structure_name;
      } else if ((data as { professional_name?: string }).professional_name) {
        return (data as { professional_name: string }).professional_name;
      }
      return t('sender.system');
    default:
      return t('sender.system');
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
