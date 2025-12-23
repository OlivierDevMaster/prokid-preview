'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';

import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import ProkidLogo from '@/features/layout/ProkidLogo';
import { useRouter } from '@/i18n/routing';

import NotificationsPanel from '../notifications/components/NotificationsPanel';

type BoNavbarProps = {
  settingsRoute?: string;
  userRole?: string;
};

export function BoNavbar({
  settingsRoute,
  userRole = 'Professionnel(le) petite enfance',
}: BoNavbarProps) {
  const router = useRouter();

  // Determine settings route based on userRole if not provided
  const getSettingsRoute = () => {
    if (settingsRoute) return settingsRoute;
    if (userRole === 'Admin') return '/admin/settings';
    if (userRole === 'Structure') return '/structure/settings';
    return '/professional/settings';
  };

  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-white shadow-sm'>
      <div className='flex items-center justify-between px-3 py-2'>
        <div>
          <Link href='/'>
            <ProkidLogo />
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <div className='rounded-full bg-blue-50 px-3 py-1'>
            <span className='text-xs font-medium text-blue-700'>
              {userRole}
            </span>
          </div>
          <LanguageSwitcher />
          {userRole !== 'Admin' && <NotificationsPanel />}
          <Button
            className='h-8 w-8 hover:bg-gray-100'
            onClick={() => router.push(getSettingsRoute())}
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
