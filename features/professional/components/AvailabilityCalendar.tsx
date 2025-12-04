'use client';

import {
  addDays,
  addWeeks,
  format,
  isSameDay,
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
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AvailabilityCalendarProps {
  professionalId: string;
}

// Mock data pour les disponibilités
const MOCK_AVAILABILITIES: Record<string, string[]> = {
  '2025-11-27': ['09:00', '14:00'],
  '2025-11-29': ['09:00', '14:00'],
};

export function AvailabilityCalendar({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  professionalId,
}: AvailabilityCalendarProps) {
  const t = useTranslations('professional.profile.calendar');
  const [currentWeek, setCurrentWeek] = useState(new Date(2025, 10, 24)); // 24 novembre 2025

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
    return MOCK_AVAILABILITIES[dateKey] || [];
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
      <div className='p-6'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CalendarIcon className='h-5 w-5 text-gray-600' />
            <h3 className='text-lg font-bold text-gray-800'>{t('title')}</h3>
          </div>
          {totalAvailableSlots > 0 && (
            <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-200'>
              {totalAvailableSlots} {t('freeSlots')}
            </Badge>
          )}
        </div>

        {/* Semaine */}
        <p className='mb-4 text-sm text-gray-600'>
          {t('weekOf')} {format(weekStart, 'd MMMM yyyy', { locale: fr })}
        </p>

        {/* Navigation */}
        <div className='mb-6 flex items-center justify-between'>
          <Button
            className='text-gray-600 hover:text-gray-800'
            onClick={goToPreviousWeek}
            size='sm'
            variant='ghost'
          >
            <ChevronLeft className='mr-1 h-4 w-4' />
            {t('previousWeek')}
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
            {t('nextWeek')}
            <ChevronRight className='ml-1 h-4 w-4' />
          </Button>
        </div>

        {/* Calendrier */}
        <div className='mb-6 grid grid-cols-7 gap-2'>
          {weekDays.map((day, index) => {
            const slots = getAvailableSlots(day);
            const isToday = isSameDay(day, new Date());
            const dayName = dayNames[index];
            const dayNumber = format(day, 'd');
            const month = format(day, 'MMM', { locale: fr });

            return (
              <div
                className={`min-h-[120px] rounded-lg border p-3 ${
                  isToday
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
                key={index}
              >
                <div className='mb-2 text-xs font-semibold text-gray-700'>
                  {dayName}
                </div>
                <div className='mb-3 text-sm text-gray-600'>
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

        {/* Instructions */}
        <div className='border-t pt-4'>
          <div className='flex items-start gap-2'>
            <CalendarIcon className='mt-0.5 h-4 w-4 text-gray-400' />
            <div>
              <p className='mb-1 text-sm font-semibold text-gray-700'>
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
