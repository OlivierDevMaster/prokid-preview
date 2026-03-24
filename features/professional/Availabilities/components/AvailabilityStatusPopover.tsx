'use client';

import { Check, ChevronDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProfessionalAvailability } from '@/features/professionals/hooks/useProfessionalAvailability';
import { cn } from '@/lib/utils';

const DURATIONS = [7, 5, 3, 1] as const;
type Duration = (typeof DURATIONS)[number];
type DurationChoice = Duration | null;

export function AvailabilityStatusPopover() {
  const t = useTranslations('professional.dashboard');
  const [open, setOpen] = useState(false);
  const [isAvailableChoice, setIsAvailableChoice] = useState<'no' | 'yes'>(
    'no'
  );
  const [duration, setDuration] = useState<DurationChoice>(null);

  const {
    isAvailable: dbIsAvailable,
    isLoading,
    isUpdating,
    updateAvailabilityAsync,
  } = useProfessionalAvailability();

  useEffect(() => {
    if (!isLoading) {
      setIsAvailableChoice(dbIsAvailable ? 'yes' : 'no');
    }
  }, [dbIsAvailable, isLoading]);

  const isAvailable = dbIsAvailable;
  const isAvailableSelected = isAvailableChoice === 'yes';

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen && !isLoading) {
      setIsAvailableChoice(dbIsAvailable ? 'yes' : 'no');
      setDuration(null);
    }
  };

  const handleConfirm = async () => {
    try {
      await updateAvailabilityAsync({
        durationDays: isAvailableSelected ? duration : null,
        isAvailable: isAvailableSelected,
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'flex h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-colors',
            isAvailable
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          )}
          type='button'
          variant='outline'
        >
          {isAvailable ? (
            <Check className='h-4 w-4' />
          ) : (
            <span className='h-2 w-2 rounded-full bg-slate-400' />
          )}
          <span>
            {isAvailable ? t('availableStatus') : t('unavailableStatus')}
          </span>
          <ChevronDown
            className={cn(
              'h-3 w-3',
              isAvailable ? 'text-white' : 'text-slate-500'
            )}
          />
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
            <span
              className={cn(
                'h-3 w-3 rounded-full',
                isAvailable ? 'bg-green-500' : 'bg-gray-300'
              )}
            />
            <span>
              {isAvailable
                ? t('availabilityPopover.confirmed')
                : t('unavailableStatus')}
            </span>
          </div>
          <button
            className='text-gray-400 hover:text-gray-600'
            onClick={() => handleOpenChange(false)}
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
            <div className='space-y-2'>
              <button
                className={cn(
                  'w-full rounded-xl border px-3 py-2 text-xs font-medium',
                  duration === null
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                )}
                onClick={() => setDuration(null)}
                type='button'
              >
                {t('availabilityPopover.untilModification')}
              </button>
            </div>
          </div>

          {/* Info pill */}
          <div className='rounded-xl bg-blue-50 px-3 py-3 text-sm text-blue-700'>
            {isAvailableSelected
              ? duration === null
                ? t('availabilityPopover.greenBadgeInfoUntilModification')
                : t('availabilityPopover.greenBadgeInfo', { count: duration })
              : t('availabilityPopover.greenBadgeRemoved')}
          </div>

          {/* Confirm button */}
          <Button
            className='w-full rounded-xl'
            disabled={isUpdating || isLoading}
            onClick={handleConfirm}
            size='lg'
          >
            {isUpdating
              ? t('loading', { defaultValue: 'Chargement...' })
              : t('availabilityPopover.confirm')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
