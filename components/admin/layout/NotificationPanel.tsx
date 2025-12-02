'use client';

import { Bell, Check, Clock, UserPlus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface Notification {
  date: string;
  description: string;
  id: string;
  isRead?: boolean;
  sender: string;
  title: string;
  type: 'mission_request' | 'team_invitation';
}

interface NotificationPanelProps {
  notifications: Notification[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function NotificationPanel({
  notifications,
  onAccept,
  onDecline,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mission_request':
        return <Clock className='h-5 w-5 text-gray-400' />;
      case 'team_invitation':
        return <UserPlus className='h-5 w-5 text-gray-400' />;
      default:
        return <Bell className='h-5 w-5 text-gray-400' />;
    }
  };

  return (
    <div className='w-96 rounded-lg border border-gray-200 bg-white shadow-lg'>
      <div className='border-b border-gray-200 p-4'>
        <h3 className='text-base font-bold text-gray-900'>Notifications</h3>
        <p className='mt-1 text-sm text-gray-700'>
          {unreadCount} nouvelle(s) notification(s)
        </p>
      </div>

      <div className='max-h-96 overflow-y-auto'>
        {notifications.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            <Bell className='mx-auto mb-4 h-12 w-12 text-gray-300' />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-200'>
            {notifications.map(notification => (
              <div
                className='p-4 transition-colors hover:bg-gray-50'
                key={notification.id}
              >
                <div className='flex items-start gap-3'>
                  <div className='mt-1 flex-shrink-0'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <h4 className='text-sm font-bold text-gray-900'>
                        {notification.title}
                      </h4>
                      <div className='flex flex-shrink-0 items-center gap-2'>
                        <span className='text-xs text-gray-500'>
                          {notification.date}
                        </span>
                        {!notification.isRead && (
                          <div className='h-2 w-2 rounded-full bg-blue-500' />
                        )}
                      </div>
                    </div>

                    <p className='mt-1 text-sm text-gray-700'>
                      {notification.description}
                    </p>

                    <p className='mt-1 text-xs text-gray-500'>
                      De: {notification.sender}
                    </p>

                    {notification.type === 'team_invitation' && (
                      <div className='mt-3 flex items-center gap-2'>
                        <Button
                          className='h-auto bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700'
                          onClick={() => onAccept?.(notification.id)}
                          size='sm'
                        >
                          <Check className='mr-1.5 h-4 w-4' />
                          Accepter
                        </Button>
                        <Button
                          className='h-auto border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50'
                          onClick={() => onDecline?.(notification.id)}
                          size='sm'
                          variant='outline'
                        >
                          <X className='mr-1.5 h-4 w-4' />
                          Décliner
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
