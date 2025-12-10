'use client';

import { Bell, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { type Notification, NotificationPanel } from './NotificationPanel';

interface ProfessionalNavbarProps {
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

export function ProfessionalNavbar({
  userRole = 'Professionnel(le) petite enfance',
}: ProfessionalNavbarProps) {
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
      <div className='flex items-center justify-between px-3 py-2'>
        <div>
          <Link href='/'>
            <h1 className='text-lg font-bold text-gray-900'>PROKID</h1>
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <div className='rounded-full bg-blue-50 px-3 py-1'>
            <span className='text-xs font-medium text-blue-700'>
              {userRole}
            </span>
          </div>

          <Popover
            onOpenChange={setIsNotificationOpen}
            open={isNotificationOpen}
          >
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
              <NotificationPanel
                notifications={notifications}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            </PopoverContent>
          </Popover>

          <Button
            className='h-8 w-8 hover:bg-gray-100'
            onClick={() => router.push('/professional/settings')}
            size='icon'
            variant='ghost'
          >
            <Settings className='h-4 w-4 text-gray-700' />
          </Button>
        </div>
      </div>
    </nav>
  );
}
