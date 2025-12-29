'use client';

import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFindAvailabilitySlots } from '@/features/availabilities/hooks/useFindAvailabilitySlots';
import { useGroupedAvailabilitySlots } from '@/features/availabilities/hooks/useGroupedAvailabilitySlots';

interface AvailabilityCalendarProps {
  professionalId: string;
}

export function AvailabilityCalendar({
  professionalId,
}: AvailabilityCalendarProps) {
  const t = useTranslations('professional.profile.calendar');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const tCommon = useTranslations('common');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch real availability data for the professional
  const { data: slots = [], isLoading } = useFindAvailabilitySlots({
    endAt: weekEnd.toISOString(),
    professionalId,
    startAt: weekStart.toISOString(),
  });

  // Group slots by day
  const groupedSlots = useGroupedAvailabilitySlots(slots);

  // Transform availability slots into date -> time slots format
  const availableSlotsByDate = useMemo(() => {
    const slotsMap: Record<string, string[]> = {};

    weekDays.forEach(day => {
      const daySlots = groupedSlots.getSlotsByDay(day);
      // Filter only available slots and format times
      const availableTimes = daySlots
        .filter(slot => slot.isAvailable)
        .map(slot => {
          const slotDate = parseISO(slot.startAt);
          return format(slotDate, 'HH:mm');
        });

      if (availableTimes.length > 0) {
        const dateKey = format(day, 'yyyy-MM-dd');
        slotsMap[dateKey] = availableTimes;
      }
    });

    return slotsMap;
  }, [groupedSlots, weekDays]);

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const isCurrentWeek = isSameDay(
    startOfWeek(currentWeek, { weekStartsOn: 1 }),
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const getAvailableSlots = (date: Date): string[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return availableSlotsByDate[dateKey] || [];
  };

  const totalAvailableSlots = weekDays.reduce(
    (total, day) => total + getAvailableSlots(day).length,
    0
  );

  const dayNames = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  return (
    <Card className='rounded-lg border border-gray-200 bg-white shadow-md'>
      <div className='p-4 md:p-6'>
        {/* Header */}
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-2'>
            <CalendarIcon className='h-5 w-5 text-gray-600' />
            <h3 className='text-base font-bold text-gray-800 md:text-lg'>
              {t('title')}
            </h3>
          </div>
          {totalAvailableSlots > 0 && (
            <Badge className='w-fit bg-blue-100 text-blue-700 hover:bg-blue-200'>
              {totalAvailableSlots} {t('freeSlots')}
            </Badge>
          )}
        </div>

        {/* Semaine */}
        <p className='mb-4 text-xs text-gray-600 md:text-sm'>
          {t('weekOf')} {format(weekStart, 'd MMMM yyyy', { locale: fr })}
        </p>

        {/* Navigation */}
        <div className='mb-6 flex flex-wrap items-center justify-between gap-2'>
          <Button
            className='text-gray-600 hover:text-gray-800'
            onClick={goToPreviousWeek}
            size='sm'
            variant='ghost'
          >
            <ChevronLeft className='mr-1 h-4 w-4' />
            <span className='hidden sm:inline'>{t('previousWeek')}</span>
            <span className='sm:hidden'>{t('previousWeek').split(' ')[0]}</span>
          </Button>
          <Button
            className={
              isCurrentWeek ? 'bg-blue-500 text-white' : 'text-gray-600'
            }
            onClick={goToCurrentWeek}
            size='sm'
            variant={isCurrentWeek ? 'default' : 'ghost'}
          >
            {t('thisWeek')}
          </Button>
          <Button
            className='text-gray-600 hover:text-gray-800'
            onClick={goToNextWeek}
            size='sm'
            variant='ghost'
          >
            <span className='hidden sm:inline'>{t('nextWeek')}</span>
            <span className='sm:hidden'>{t('nextWeek').split(' ')[0]}</span>
            <ChevronRight className='ml-1 h-4 w-4' />
          </Button>
        </div>

        {/* Calendrier */}
        {isLoading ? (
          <div className='mb-6 flex items-center justify-center py-12'>
            <p className='text-sm text-gray-500'>
              {tCommon('messages.loading')}
            </p>
          </div>
        ) : (
          <div className='mb-6 overflow-x-auto md:overflow-visible'>
            <div className='grid min-w-[700px] grid-cols-7 gap-2 md:min-w-0'>
              {weekDays.map((day, index) => {
                const slots = getAvailableSlots(day);
                const isToday = isSameDay(day, new Date());
                const dayName = dayNames[index];
                const dayNumber = format(day, 'd');
                const month = format(day, 'MMM', { locale: fr });

                return (
                  <div
                    className={`min-h-[120px] rounded-lg border p-2 md:p-3 ${
                      isToday
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    key={index}
                  >
                    <div className='mb-2 text-xs font-semibold text-gray-700'>
                      {dayName}
                    </div>
                    <div className='mb-3 text-xs text-gray-600 md:text-sm'>
                      {dayNumber} {month}
                    </div>
                    {slots.length > 0 ? (
                      <div className='space-y-1'>
                        {slots.map((slot, slotIndex) => (
                          <Button
                            className='w-full border-blue-200 bg-blue-50 text-xs text-blue-700 hover:bg-blue-100'
                            key={slotIndex}
                            size='sm'
                            variant='outline'
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className='mt-2 h-px bg-gray-200' />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className='border-t pt-4'>
          <div className='flex items-start gap-2'>
            <CalendarIcon className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />
            <div>
              <p className='mb-1 text-xs font-semibold text-gray-700 md:text-sm'>
                {t('howToBook')}
              </p>
              <p className='text-xs leading-relaxed text-gray-600'>
                {t('bookingInstructions')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
