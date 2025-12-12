import { Bell } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { NotificationRow } from '../notification.model';
import { NotificationPopover } from './NotificationPopover';

export default function NotificationsPanel() {
  const notifications: NotificationRow[] = [];
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read_at).length;
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
        className='w-auto border-gray-200 p-0 shadow-xl'
        sideOffset={8}
      >
        <NotificationPopover
          notifications={notifications}
          onAccept={() => {}}
          onDecline={() => {}}
        />
      </PopoverContent>
    </Popover>
  );
}
