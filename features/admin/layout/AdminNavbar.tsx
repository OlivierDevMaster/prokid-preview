'use client';

import { Bell, Settings } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { type Notification, NotificationPanel } from './NotificationPanel';

interface AdminNavbarProps {
  userRole?: string;
}

const mockNotifications: Notification[] = [
  {
    date: '15/01/2024',
    description: 'Micro-crèche Nawan vous invite à rejoindre leur équipe',
    id: '1',
    isRead: false,
    sender: 'Micro-crèche Nawan',
    title: "Invitation d'équipe",
    type: 'team_invitation',
  },
  {
    date: '14/01/2024',
    description: 'Crèche Les Bambins souhaite programmer une intervention',
    id: '2',
    isRead: false,
    sender: 'Crèche Les Bambins',
    title: 'Nouvelle demande de mission',
    type: 'mission_request',
  },
];

export function AdminNavbar({
  userRole = 'Professionnel(le) petite enfance',
}: AdminNavbarProps) {
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleAccept = (id: string) => {
    console.log('Accept notification:', id);
  };

  const handleDecline = (id: string) => {
    console.log('Decline notification:', id);
  };

  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-white shadow-sm'>
      <div className='px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1' />

          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-blue-50 px-4 py-1.5'>
              <span className='text-sm font-medium text-blue-700'>
                {userRole}
              </span>
            </div>

            <Popover
              onOpenChange={setIsNotificationOpen}
              open={isNotificationOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  className='relative h-10 w-10 hover:bg-gray-100'
                  size='icon'
                  variant='ghost'
                >
                  <Bell className='h-5 w-5 text-gray-700' />
                  {unreadCount > 0 && (
                    <span className='absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white'>
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
                <NotificationPanel
                  notifications={notifications}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              </PopoverContent>
            </Popover>

            <Button
              className='h-10 w-10 hover:bg-gray-100'
              onClick={() => router.push('/admin/settings')}
              size='icon'
              variant='ghost'
            >
              <Settings className='h-5 w-5 text-gray-700' />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
