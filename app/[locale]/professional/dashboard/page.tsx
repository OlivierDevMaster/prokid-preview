'use client';

import { ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const t = useTranslations('professional.dashboard');
  const { data: session } = useSession();
  const { data: professional } = useFindProfessional(session?.user?.id);

  // Get user's first name from professional profile
  const firstName =
    professional?.profile?.first_name || session?.user?.name || '';

  // Mock values for UI only
  const availabilityDaysCount = 30;
  const unreadCount = 2;
  const isAvailable = true;

  return (
    <div className='min-h-screen bg-blue-50/30 p-4 sm:p-6 lg:p-8'>
      {/* Header with greeting and status */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {t('greeting', { name: firstName })}
          </h1>
          <div className='mt-1 flex items-center gap-2 text-sm text-gray-600'>
            <span>{t('availabilityDaysShort')}</span>
            <span className='text-blue-600'>
              {availabilityDaysCount} {t('daysLabel')}
            </span>
            <span className='text-gray-400'>·</span>
            <span className='text-blue-600'>
              {t('unreadNotifications', { count: unreadCount })}
            </span>
          </div>
        </div>

        {/* Availability Status Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2',
                isAvailable
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              variant='outline'
            >
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isAvailable ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
              <span>
                {isAvailable ? t('availableStatus') : t('unavailableStatus')}
              </span>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>
              {isAvailable ? t('unavailableStatus') : t('availableStatus')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
