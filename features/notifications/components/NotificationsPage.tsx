'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Notification } from '../notification.model';

import { useAcceptNotification } from '../hooks/useAcceptNotification';
import { useDeclineNotification } from '../hooks/useDeclineNotification';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationUnreadCount } from '../hooks/useUnreadCount';
import { NotificationCard } from './NotificationCard';

export function NotificationsPage() {
  const t = useTranslations('notifications');
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  const filters = {
    recipient_id: userId,
    ...(filter === 'read'
      ? { read: true }
      : filter === 'unread'
        ? { read: false }
        : {}),
  };

  const { data: notificationsData, isLoading } = useNotifications(filters);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: acceptNotification } = useAcceptNotification();
  const { mutate: declineNotification } = useDeclineNotification();
  const { data: unreadCount = 0 } = useNotificationUnreadCount(userId ?? '');

  const notifications = (notificationsData?.data ?? []) as Notification[];

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleAccept = (notification: Notification) => {
    acceptNotification(notification, {
      onSuccess: () => {
        markAsRead(notification.id);
      },
    });
  };

  const handleDecline = (notification: Notification) => {
    declineNotification(notification, {
      onSuccess: () => {
        markAsRead(notification.id);
      },
    });
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-blue-50/30'>
        <p className='text-gray-600'>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-blue-50/30 p-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>
            <p className='mt-2 text-sm text-gray-600'>
              {t('subtitle', {
                total: notifications.length,
                unread: unreadCount,
              })}
            </p>
          </div>
          <Select
            onValueChange={(value: string) =>
              setFilter(value as 'all' | 'read' | 'unread')
            }
            value={filter}
          >
            <SelectTrigger className='w-40'>
              <SelectValue placeholder={t('filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('filterAll')}</SelectItem>
              <SelectItem value='unread'>{t('filterUnread')}</SelectItem>
              <SelectItem value='read'>{t('filterRead')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className='rounded-lg border border-gray-200 bg-white p-12 text-center'>
            <p className='text-gray-500'>{t('noNotifications')}</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {notifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
