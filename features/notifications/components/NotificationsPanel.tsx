'use client';

import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useRole } from '@/hooks/useRole';
import { Link } from '@/i18n/routing';

import type { Notification } from '../notification.model';

import { useAcceptNotification } from '../hooks/useAcceptNotification';
import { useDeclineNotification } from '../hooks/useDeclineNotification';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationsRealtime } from '../hooks/useNotificationsRealtime';
import { useNotificationUnreadCount } from '../hooks/useUnreadCount';
import { NotificationPopover } from './NotificationPopover';

export default function NotificationsPanel() {
  const t = useTranslations('notifications');
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { isAdmin, isProfessional, isStructure } = useRole();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [redirectLink, setRedirectLink] = useState<null | string>(null);

  useNotificationsRealtime();

  const { data: notificationsData } = useNotifications(
    {
      read: false,
      recipient_id: userId,
    },
    { limit: 10, page: 1 }
  );

  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: acceptNotification } = useAcceptNotification();
  const { mutate: declineNotification } = useDeclineNotification();

  const notifications = (notificationsData?.data ?? []) as Notification[];
  const { data: unreadCount = 0 } = useNotificationUnreadCount(userId ?? '');

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

  const handleAccept = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      acceptNotification(notification, {
        onSuccess: () => {
          markAsRead(notificationId);
        },
      });
    }
  };

  const handleDecline = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      declineNotification(notification, {
        onSuccess: () => {
          markAsRead(notificationId);
        },
      });
    }
  };

  return (
    <Popover onOpenChange={setIsNotificationOpen} open={isNotificationOpen}>
      <PopoverTrigger asChild>
        <Button
          className='relative h-8 w-8 hover:bg-gray-100'
          size='icon'
          variant='ghost'
        >
          <Bell className='h-4 w-4 text-gray-700' />
          {unreadCount > 0 && (
            <span className='absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-auto border-gray-200 p-0'
        sideOffset={8}
      >
        <NotificationPopover
          notifications={notifications}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
        {notifications.length > 0 && (
          <div className='border-t border-gray-200 p-3'>
            <Link href={redirectLink ?? '/notifications'}>
              <Button
                className='w-full'
                onClick={() => setIsNotificationOpen(false)}
                variant='outline'
              >
                {t('viewAll')}
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
