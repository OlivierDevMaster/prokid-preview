'use client';

import { ChevronDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const DURATIONS = [7, 5, 3, 1] as const;
type Duration = (typeof DURATIONS)[number];

export function AvailabilityStatusPopover() {
  const t = useTranslations('professional.dashboard');
  const [open, setOpen] = useState(false);
  const [isAvailableChoice, setIsAvailableChoice] = useState<'no' | 'yes'>(
    'yes'
  );
  const [duration, setDuration] = useState<Duration>(7);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className='flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200'
          type='button'
          variant='outline'
        >
          <span className='h-2 w-2 rounded-3xl bg-green-500' />
          <span>{t('availableStatus')}</span>
          <ChevronDown className='h-3 w-3 text-green-700' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-[360px] rounded-2xl border-gray-200 bg-white p-4 shadow-xl'
        sideOffset={8}
      >
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm font-medium text-gray-800'>
            <span className='h-3 w-3 rounded-full bg-green-500' />
            <span>{t('availabilityPopover.confirmed')}</span>
          </div>
          <button
            className='text-gray-400 hover:text-gray-600'
            onClick={() => setOpen(false)}
            type='button'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='mt-4 space-y-4'>
          {/* Question: available */}
          <div className='space-y-2'>
            <p className='text-sm font-semibold text-gray-800'>
              {t('availabilityPopover.questionAvailable')}
            </p>
            <div className='grid grid-cols-2 gap-2'>
              <button
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-medium',
                  isAvailableChoice === 'no'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                )}
                onClick={() => setIsAvailableChoice('no')}
                type='button'
              >
                {t('availabilityPopover.no')}
              </button>
              <button
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-medium',
                  isAvailableChoice === 'yes'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                )}
                onClick={() => setIsAvailableChoice('yes')}
                type='button'
              >
                {t('availabilityPopover.yes')}
              </button>
            </div>
          </div>

          {/* Question: duration */}
          <div className='space-y-2'>
            <p className='text-sm font-semibold text-gray-800'>
              {t('availabilityPopover.questionDuration')}
            </p>
            <div className='grid grid-cols-4 gap-2'>
              {DURATIONS.map(value => (
                <button
                  className={cn(
                    'rounded-3xl border px-3 py-2 text-xs font-medium',
                    duration === value
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  )}
                  key={value}
                  onClick={() => setDuration(value)}
                  type='button'
                >
                  {t('availabilityPopover.days', { count: value })}
                </button>
              ))}
            </div>
          </div>

          {/* Info pill */}
          <div className='rounded-xl bg-blue-50 px-3 py-3 text-sm text-blue-700'>
            {t('availabilityPopover.greenBadgeInfo', { count: duration })}
          </div>

          {/* Confirm button */}
          <Button
            className='w-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700'
            type='button'
          >
            {t('availabilityPopover.confirm')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
