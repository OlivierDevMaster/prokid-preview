'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/features/paginations/components/Pagination';

import type { Notification } from '../notification.model';

import { useAcceptNotification } from '../hooks/useAcceptNotification';
import { useDeclineNotification } from '../hooks/useDeclineNotification';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationsRealtime } from '../hooks/useNotificationsRealtime';
import { useNotificationUnreadCount } from '../hooks/useUnreadCount';
import { NotificationConfig } from '../notification.config';
import { NotificationCard } from './NotificationCard';

export function NotificationsPage() {
  const t = useTranslations('notifications');
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');

  useNotificationsRealtime();

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(NotificationConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(NotificationConfig.PAGE_SIZE_DEFAULT)
  );

  const filters = {
    recipient_id: userId,
    ...(filter === 'read'
      ? { read: true }
      : filter === 'unread'
        ? { read: false }
        : {}),
  };

  const { data: notificationsData, isLoading } = useNotifications(filters, {
    limit: pageSize,
    page,
  });
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: acceptNotification } = useAcceptNotification();
  const { mutate: declineNotification } = useDeclineNotification();
  const { data: unreadCount = 0 } = useNotificationUnreadCount(userId ?? '');

  const notifications = (notificationsData?.data ?? []) as Notification[];
  const totalCount = notificationsData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

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

  const handleFilterChange = (value: string) => {
    setFilter(value as 'all' | 'read' | 'unread');
    setPage(NotificationConfig.PAGE_DEFAULT);
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-blue-50/30'>
        <p className='text-sm text-gray-600 sm:text-base'>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-blue-50/30 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <div className='mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800 sm:text-3xl'>
              {t('title')}
            </h1>
            <p className='mt-2 text-xs text-gray-600 sm:text-sm'>
              {t('subtitle', {
                total: totalCount,
                unread: unreadCount,
              })}
            </p>
          </div>
          <Select onValueChange={handleFilterChange} value={filter}>
            <SelectTrigger className='w-full sm:w-40'>
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
          <div className='rounded-lg border border-gray-200 bg-white p-8 text-center sm:p-12'>
            <p className='text-sm text-gray-500 sm:text-base'>
              {t('noNotifications')}
            </p>
          </div>
        ) : (
          <div className='space-y-3 sm:space-y-4'>
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

        {/* Pagination */}
        {totalCount > 0 && (
          <div className='mt-4 sm:mt-6 lg:mt-8'>
            <Pagination
              currentPage={page}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSize={pageSize}
              totalItems={totalCount}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
