'use client';

import { addDays, format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ProfessionalAvailabilitySelectProps {
  onDateChange: (value: string) => void;
  onDurationDaysChange: (value: null | number) => void;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  open: boolean;
  selectedDate: string;
  selectedDurationDays: null | number;
}

export function ProfessionalAvailabilitySelect({
  onDateChange,
  onDurationDaysChange,
  onOpenChange,
  onValueChange,
  open,
  selectedDate,
  selectedDurationDays,
}: ProfessionalAvailabilitySelectProps) {
  const t = useTranslations('professional');
  const [draftDate, setDraftDate] = useState(selectedDate);
  const [draftDurationDays, setDraftDurationDays] = useState<'' | number>(
    selectedDurationDays ?? ''
  );
  const [isDurationDisabled, setIsDurationDisabled] = useState(false);

  useEffect(() => {
    if (!open) {
      setDraftDate(selectedDate);
      setDraftDurationDays(selectedDurationDays ?? '');
      setIsDurationDisabled(false);
    }
  }, [open, selectedDate, selectedDurationDays]);

  const setQuickDate = (daysToAdd: number) => {
    setDraftDate(format(addDays(new Date(), daysToAdd), 'yyyy-MM-dd'));
    setDraftDurationDays('');
    setIsDurationDisabled(true);
  };
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const tomorrowDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const isApplyDisabled =
    draftDate.length === 0 ||
    (!isDurationDisabled && typeof draftDurationDays !== 'number');

  const handleApply = () => {
    const normalizedDuration =
      typeof draftDurationDays === 'number'
        ? Math.max(1, draftDurationDays)
        : null;

    onValueChange('available');
    onDateChange(draftDate);
    onDurationDaysChange(normalizedDuration);
    onOpenChange(false);
  };

  return (
    <div className='space-y-2'>
      <Popover onOpenChange={onOpenChange} open={open}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'h-9 w-full justify-between rounded-xl border border-slate-200 bg-slate-100 px-4 text-xs font-medium text-slate-800 shadow-none hover:bg-slate-100',
              open && 'border-blue-500 bg-blue-50 text-blue-600'
            )}
            type='button'
            variant='outline'
          >
            <div className='flex items-center justify-between gap-2'>
              <span>{t('search.availability')}</span>
              <CalendarDays className='h-4 w-4 text-current' />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-[320px] rounded-2xl border-slate-200 bg-white p-4 shadow-xl'
          sideOffset={8}
        >
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex gap-2'>
                <Button
                  className={cn(
                    'h-8 rounded-lg border px-3 text-xs',
                    draftDate === todayDate &&
                      'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100'
                  )}
                  onClick={() => setQuickDate(0)}
                  type='button'
                  variant='outline'
                >
                  {t('search.today')}
                </Button>
                <Button
                  className={cn(
                    'h-8 rounded-lg border px-3 text-xs',
                    draftDate === tomorrowDate &&
                      'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100'
                  )}
                  onClick={() => setQuickDate(1)}
                  type='button'
                  variant='outline'
                >
                  {t('search.tomorrow')}
                </Button>
              </div>
              <div className='mt-6'>
                <label
                  className='text-sm font-semibold text-slate-800'
                  htmlFor='availability-date'
                >
                  {t('search.date')}
                </label>
              </div>
              <input
                className='h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50'
                id='availability-date'
                onChange={event => {
                  setDraftDate(event.target.value);
                  setIsDurationDisabled(false);
                }}
                type='date'
                value={draftDate}
              />
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-semibold text-slate-800'>
                {t('search.durationDays')}
              </p>
              <input
                className='h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50'
                disabled={isDurationDisabled}
                min={1}
                onChange={event => {
                  if (event.target.value === '') {
                    setDraftDurationDays('');
                    return;
                  }

                  const parsedValue = Number.parseInt(event.target.value, 10);

                  if (Number.isNaN(parsedValue)) {
                    setDraftDurationDays('');
                    return;
                  }

                  setDraftDurationDays(Math.max(1, parsedValue));
                }}
                step={1}
                type='number'
                value={draftDurationDays}
              />
            </div>

            <Button
              className='w-full rounded-xl'
              disabled={isApplyDisabled}
              onClick={handleApply}
              type='button'
            >
              {t('search.apply')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
