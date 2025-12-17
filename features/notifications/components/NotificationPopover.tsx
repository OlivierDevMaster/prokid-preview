'use client';

import { format } from 'date-fns';
import { Bell, Check, Clock, UserPlus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';
import { Link } from '@/i18n/routing';

import type { Notification } from '../notification.model';

import {
  canAcceptOrDecline,
  getNotificationDescription,
  getNotificationSender,
  getNotificationTitle,
} from '../utils/notification.utils';

interface NotificationPanelProps {
  notifications: Notification[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function NotificationPopover({
  notifications,
  onAccept,
  onDecline,
}: NotificationPanelProps) {
  const t = useTranslations('notifications');
  const { isAdmin, isProfessional, isStructure } = useRole();
  const [baseRedirectLink, setBaseRedirectLink] =
    useState<string>('/notifications');
  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Set redirect link based on user role
  useEffect(() => {
    if (isProfessional) {
      setBaseRedirectLink('/professional/notifications');
    } else if (isStructure) {
      setBaseRedirectLink('/structure/notifications');
    } else if (isAdmin) {
      setBaseRedirectLink('/admin/notifications');
    } else {
      setBaseRedirectLink('/notifications');
    }
  }, [isAdmin, isProfessional, isStructure]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invitation_received':
        return <UserPlus className='h-5 w-5 text-gray-400' />;
      case 'mission_received':
        return <Clock className='h-5 w-5 text-gray-400' />;
      default:
        return <Bell className='h-5 w-5 text-gray-400' />;
    }
  };

  return (
    <div className='w-96 rounded-lg border border-gray-200 bg-white shadow-lg'>
      <div className='border-b border-gray-200 p-4'>
        <h3 className='text-base font-bold text-gray-900'>{t('title')}</h3>
        <p className='mt-1 text-sm text-gray-700'>
          {t('unreadCount', { count: unreadCount })}
        </p>
      </div>

      <div className='max-h-96 overflow-y-auto'>
        {notifications.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            <Bell className='mx-auto mb-4 h-12 w-12 text-gray-300' />
            <p>{t('noNotifications')}</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-200'>
            {notifications.map(notification => (
              <div
                className='group transition-colors hover:bg-gray-50'
                key={notification.id}
              >
                <Link
                  className='block'
                  href={`${baseRedirectLink}/${notification.id}`}
                >
                  <div className='p-4'>
                    <div className='flex items-start gap-3'>
                      <div className='mt-1 flex-shrink-0'>
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            notification.read_at ? 'bg-gray-100' : 'bg-blue-100'
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <h4 className='text-sm font-bold text-gray-900'>
                            {getNotificationTitle(notification)}
                          </h4>
                          <div className='flex flex-shrink-0 items-center gap-2'>
                            <span className='text-xs text-gray-500'>
                              {format(
                                new Date(notification.created_at),
                                'dd/MM/yyyy'
                              )}
                            </span>
                            {!notification.read_at && (
                              <div className='h-2 w-2 rounded-full bg-blue-500' />
                            )}
                          </div>
                        </div>

                        <p className='mt-1 line-clamp-2 text-sm text-gray-700'>
                          {getNotificationDescription(notification)}
                        </p>

                        <p className='mt-1 text-xs text-gray-500'>
                          {t('from')}: {getNotificationSender(notification)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {canAcceptOrDecline(notification) && (
                  <div className='border-t border-gray-100 bg-gray-50 px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <Button
                        className='h-auto flex-1 bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700'
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAccept?.(notification.id);
                        }}
                        size='sm'
                      >
                        <Check className='mr-1.5 h-4 w-4' />
                        {t('accept')}
                      </Button>
                      <Button
                        className='h-auto flex-1 border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50'
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDecline?.(notification.id);
                        }}
                        size='sm'
                        variant='outline'
                      >
                        <X className='mr-1.5 h-4 w-4' />
                        {t('decline')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
