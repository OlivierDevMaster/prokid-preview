'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Bell,
  Check,
  Clock,
  FileText,
  Loader2,
  UserPlus,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from '@/i18n/routing';

import type { Notification } from '../notification.model';

import { useAcceptNotification } from '../hooks/useAcceptNotification';
import { useDeclineNotification } from '../hooks/useDeclineNotification';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { useNotification } from '../hooks/useNotification';
import {
  canAcceptOrDecline,
  getAcceptButtonLabel,
  getDeclineButtonLabel,
  getNotificationDescription,
  getNotificationSender,
  getNotificationStatus,
  getNotificationTitle,
} from '../utils/notification.utils';

export function NotificationDetails() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();
  const { data: notification, isLoading } = useNotification(id as string);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { isPending: isAccepting, mutate: acceptNotification } =
    useAcceptNotification();
  const { isPending: isDeclining, mutate: declineNotification } =
    useDeclineNotification();

  const isProcessing = isAccepting || isDeclining;

  const { data: notificationStatus } = useQuery({
    enabled: !!notification && canAcceptOrDecline(notification),
    queryFn: () => getNotificationStatus(notification!),
    queryKey: ['notification-status', notification?.id],
  });

  // Mark as read when viewing
  useEffect(() => {
    if (notification && !notification.read_at) {
      markAsRead(notification.id);
    }
  }, [notification, markAsRead]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <p className='text-gray-600'>{t('loading')}</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Button onClick={() => router.back()} variant='outline'>
            {t('back')}
          </Button>
        </Card>
      </div>
    );
  }

  const isRead = !!notification.read_at;
  const typedNotification = notification as Notification;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invitation_received':
        return <UserPlus className='h-8 w-8 text-blue-500' />;
      case 'mission_ended':
        return <Check className='h-8 w-8 text-blue-500' />;
      case 'mission_expired':
        return <Clock className='h-8 w-8 text-orange-500' />;
      case 'mission_received':
        return <Clock className='h-8 w-8 text-green-500' />;
      case 'report_sent':
        return <FileText className='h-8 w-8 text-purple-500' />;
      default:
        return <Bell className='h-8 w-8 text-gray-400' />;
    }
  };

  const handleAccept = () => {
    acceptNotification(typedNotification, {
      onSuccess: () => {
        markAsRead(notification.id);
        queryClient.invalidateQueries({
          queryKey: ['notification', notification.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['notification-status', notification.id],
        });
      },
    });
  };

  const handleDecline = () => {
    declineNotification(typedNotification, {
      onSuccess: () => {
        markAsRead(notification.id);
        queryClient.invalidateQueries({
          queryKey: ['notification', notification.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['notification-status', notification.id],
        });
      },
    });
  };

  return (
    <div className='min-h-screen bg-blue-50/30 p-8'>
      <div className='mx-auto'>
        <div className='mb-6'>
          <Button onClick={() => router.back()} variant='ghost'>
            ← {t('back')}
          </Button>
        </div>

        <Card className='p-8'>
          <div className='mb-6 flex flex-col items-start gap-6 sm:flex-row'>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                isRead ? 'bg-gray-100' : 'bg-blue-100'
              }`}
            >
              {getNotificationIcon(typedNotification.type)}
            </div>
            <div className='flex-1'>
              <div className='mb-2 flex items-center gap-2 sm:items-start'>
                <h1 className='text-xl font-bold text-gray-800 sm:text-2xl'>
                  {getNotificationTitle(typedNotification, t)}
                </h1>
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
                {notificationStatus === 'pending' && (
                  <Badge className='bg-yellow-500 text-white' variant='default'>
                    {t('pending')}
                  </Badge>
                )}
                {notificationStatus === 'accepted' && (
                  <Badge className='bg-green-500 text-white' variant='default'>
                    {t('accepted')}
                  </Badge>
                )}
                {notificationStatus === 'declined' && (
                  <Badge className='bg-red-500 text-white' variant='default'>
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
              </div>
              <p className='mb-4 text-gray-600'>
                {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>

          <div className='mb-6 space-y-4'>
            <div>
              <h2 className='mb-2 text-sm font-semibold text-gray-700'>
                {t('description')}
              </h2>
              <p className='text-gray-800'>
                {getNotificationDescription(typedNotification, t)}
              </p>
            </div>

            <div>
              <h2 className='mb-2 text-sm font-semibold text-gray-700'>
                {t('from')}
              </h2>
              <p className='text-gray-800'>
                {getNotificationSender(typedNotification, t)}
              </p>
            </div>

            {notification.read_at && (
              <div>
                <h2 className='mb-2 text-sm font-semibold text-gray-700'>
                  {t('readAt')}
                </h2>
                <p className='text-gray-800'>
                  {format(new Date(notification.read_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>

          {canAcceptOrDecline(typedNotification) && (
            <div className='border-t pt-6'>
              {notificationStatus === 'pending' && (
                <div className='flex items-center gap-3'>
                  <Button
                    className='bg-blue-600 text-white hover:bg-blue-700'
                    disabled={isProcessing}
                    onClick={handleAccept}
                  >
                    {isAccepting ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Check className='mr-2 h-4 w-4' />
                    )}
                    {getAcceptButtonLabel(typedNotification, t)}
                  </Button>
                  <Button
                    className='border-gray-300 text-gray-700 hover:bg-gray-50'
                    disabled={isProcessing}
                    onClick={handleDecline}
                    variant='outline'
                  >
                    {isDeclining ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <X className='mr-2 h-4 w-4' />
                    )}
                    {getDeclineButtonLabel(typedNotification, t)}
                  </Button>
                </div>
              )}
              {notificationStatus !== 'pending' && notificationStatus && (
                <div className='flex items-center gap-3'>
                  {notificationStatus === 'accepted' && (
                    <Badge
                      className='bg-green-500 text-white'
                      variant='default'
                    >
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
                    <Badge
                      className='bg-orange-500 text-white'
                      variant='default'
                    >
                      {t('expired')}
                    </Badge>
                  )}
                  {notificationStatus === 'ended' && (
                    <Badge className='bg-blue-500 text-white' variant='default'>
                      {t('ended')}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
