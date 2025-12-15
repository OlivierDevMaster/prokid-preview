'use client';

import { format } from 'date-fns';
import { Bell, Check, Clock, FileText, UserPlus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import type { Notification } from '../notification.model';

import { useAcceptNotification } from '../hooks/useAcceptNotification';
import { useDeclineNotification } from '../hooks/useDeclineNotification';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { useNotification } from '../hooks/useNotification';
import {
  canAcceptOrDecline,
  getNotificationDescription,
  getNotificationSender,
  getNotificationTitle,
} from '../utils/notification.utils';

export function NotificationDetails() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations('notifications');
  const { data: notification, isLoading } = useNotification(id as string);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: acceptNotification } = useAcceptNotification();
  const { mutate: declineNotification } = useDeclineNotification();

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
          <Button onClick={() => router.back()}>{t('back')}</Button>
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
      },
    });
  };

  const handleDecline = () => {
    declineNotification(typedNotification, {
      onSuccess: () => {
        markAsRead(notification.id);
      },
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl'>
        <div className='mb-6'>
          <Button onClick={() => router.back()} variant='ghost'>
            ← {t('back')}
          </Button>
        </div>

        <Card className='p-8'>
          <div className='mb-6 flex items-start gap-6'>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                isRead ? 'bg-gray-100' : 'bg-blue-100'
              }`}
            >
              {getNotificationIcon(typedNotification.type)}
            </div>
            <div className='flex-1'>
              <div className='mb-2 flex items-center gap-2'>
                <h1 className='text-2xl font-bold text-gray-800'>
                  {getNotificationTitle(typedNotification)}
                </h1>
                {!isRead && (
                  <Badge className='bg-blue-500 text-white' variant='default'>
                    {t('unread')}
                  </Badge>
                )}
                {isRead && (
                  <Badge
                    className='bg-gray-200 text-gray-600'
                    variant='secondary'
                  >
                    {t('read')}
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
                {getNotificationDescription(typedNotification)}
              </p>
            </div>

            <div>
              <h2 className='mb-2 text-sm font-semibold text-gray-700'>
                {t('from')}
              </h2>
              <p className='text-gray-800'>
                {getNotificationSender(typedNotification)}
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
            <div className='flex items-center gap-3 border-t pt-6'>
              <Button
                className='bg-green-600 text-white hover:bg-green-700'
                onClick={handleAccept}
              >
                <Check className='mr-2 h-4 w-4' />
                {t('accept')}
              </Button>
              <Button
                className='border-gray-300 text-gray-700 hover:bg-gray-50'
                onClick={handleDecline}
                variant='outline'
              >
                <X className='mr-2 h-4 w-4' />
                {t('decline')}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
