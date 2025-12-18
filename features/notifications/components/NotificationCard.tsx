'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Bell, Check, Clock, FileText, UserPlus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRole } from '@/hooks/useRole';

import type { Notification } from '../notification.model';

import {
  canAcceptOrDecline,
  getAcceptButtonLabel,
  getDeclineButtonLabel,
  getNotificationDescription,
  getNotificationSender,
  getNotificationStatus,
  getNotificationTitle,
} from '../utils/notification.utils';

interface NotificationCardProps {
  notification: Notification;
  onAccept?: (notification: Notification) => void;
  onDecline?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
}

export function NotificationCard({
  notification,
  onAccept,
  onDecline,
  onMarkAsRead,
}: NotificationCardProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const isRead = !!notification.read_at;
  const { isAdmin, isProfessional, isStructure } = useRole();
  const [redirectLink, setRedirectLink] = useState<null | string>(null);

  const { data: notificationStatus } = useQuery({
    enabled: canAcceptOrDecline(notification),
    queryFn: () => getNotificationStatus(notification),
    queryKey: ['notification-status', notification.id],
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invitation_received':
        return <UserPlus className='h-5 w-5 text-blue-500' />;
      case 'mission_ended':
        return <Check className='h-5 w-5 text-blue-500' />;
      case 'mission_expired':
        return <Clock className='h-5 w-5 text-orange-500' />;
      case 'mission_received':
        return <Clock className='h-5 w-5 text-green-500' />;
      case 'report_sent':
        return <FileText className='h-5 w-5 text-purple-500' />;
      default:
        return <Bell className='h-5 w-5 text-gray-400' />;
    }
  };

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    router.push(`${redirectLink}/${notification.id}`);
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept?.(notification);
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline?.(notification);
  };

  // Set redirect link based on user role
  useEffect(() => {
    if (isProfessional) {
      setRedirectLink('/professional/notifications');
    } else if (isStructure) {
      setRedirectLink('/structure/notifications');
    } else if (isAdmin) {
      setRedirectLink('/admin/notifications');
    } else {
      setRedirectLink('/notifications');
    }
  }, [isAdmin, isProfessional, isStructure]);

  return (
    <Card
      className={`cursor-pointer bg-white transition-all hover:shadow-md`}
      onClick={handleClick}
    >
      <div className='p-4'>
        <div className='flex items-start gap-4'>
          <div className='mt-1 flex-shrink-0'>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isRead ? 'bg-gray-100' : 'bg-blue-100'
              }`}
            >
              {getNotificationIcon(notification.type)}
            </div>
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <h4 className='text-sm font-bold text-gray-900'>
                    {getNotificationTitle(notification, t)}
                  </h4>
                  {!isRead && (
                    <Badge className='bg-blue-500 text-white' variant='default'>
                      {t('unreadSingular')}
                    </Badge>
                  )}
                  {isRead && (
                    <Badge
                      className='bg-gray-200 text-gray-600'
                      variant='secondary'
                    >
                      {t('readSingular')}
                    </Badge>
                  )}
                </div>
                <p className='mb-2 text-sm text-gray-700'>
                  {getNotificationDescription(notification, t)}
                </p>
                <div className='mb-2 flex items-center gap-2 text-xs text-gray-500'>
                  <span>
                    {t('from')}: {getNotificationSender(notification, t)}
                  </span>
                  <span>•</span>
                  <span>
                    {format(
                      new Date(notification.created_at),
                      'dd/MM/yyyy HH:mm'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {canAcceptOrDecline(notification) && (
              <div className='mt-3'>
                {notificationStatus === 'accepted' && (
                  <Badge className='bg-green-500 text-white' variant='default'>
                    <Check className='mr-1 h-3 w-3' />
                    {t('accepted')}
                  </Badge>
                )}
                {notificationStatus === 'declined' && (
                  <Badge className='bg-red-500 text-white' variant='default'>
                    <X className='mr-1 h-3 w-3' />
                    {t('declined')}
                  </Badge>
                )}
                {notificationStatus === 'cancelled' && (
                  <Badge className='bg-gray-500 text-white' variant='default'>
                    {t('cancelled')}
                  </Badge>
                )}
                {notificationStatus === 'expired' && (
                  <Badge className='bg-orange-500 text-white' variant='default'>
                    {t('expired')}
                  </Badge>
                )}
                {notificationStatus === 'ended' && (
                  <Badge className='bg-blue-500 text-white' variant='default'>
                    {t('ended')}
                  </Badge>
                )}
                {notificationStatus === 'pending' && (
                  <div className='flex items-center gap-2'>
                    <Button
                      className='h-auto bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700'
                      onClick={handleAccept}
                      size='sm'
                    >
                      <Check className='mr-1.5 h-4 w-4' />
                      {getAcceptButtonLabel(notification, t)}
                    </Button>
                    <Button
                      className='h-auto border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50'
                      onClick={handleDecline}
                      size='sm'
                      variant='outline'
                    >
                      <X className='mr-1.5 h-4 w-4' />
                      {getDeclineButtonLabel(notification, t)}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
