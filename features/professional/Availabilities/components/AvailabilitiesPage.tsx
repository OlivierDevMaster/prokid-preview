'use client';

import { useQueryClient } from '@tanstack/react-query';
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
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Pencil,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { AvailabilitySlot } from '@/features/availabilities/availability.model';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  deleteAvailabilityBySlot,
  stopRecurrenceForSlot,
} from '../availabilities.service';
import { useGetAvailabilities } from '../hooks/useGetAvailabilities';
import AvailabilitiesEditPage from './AvailabilitiesEditPage';

export default function AvailabilitiesPage() {
  const t = useTranslations('admin.availabilities');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id || '';
  // Initialiser avec la date actuelle après le montage pour éviter les problèmes d'hydratation
  const [currentWeek, setCurrentWeek] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<null | string>(null);
  const [stoppingRecurrenceId, setStoppingRecurrenceId] = useState<
    null | string
  >(null);
  const [openPopoverId, setOpenPopoverId] = useState<null | string>(null);

  // S'assurer que le composant est monté côté client avant d'utiliser des valeurs dynamiques
  useEffect(() => {
    setMounted(true);
    // Mettre à jour avec la date actuelle une fois monté
    setCurrentWeek(new Date());
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch availabilities for the current week
  const { groupedSlots, isFetched, isLoading, slots } =
    useGetAvailabilities(weekStart);

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleDeleteSlot = async (slot: AvailabilitySlot) => {
    if (!userId) return;

    // Prevent deletion if slot is booked
    if (!slot.isAvailable && slot.mission) {
      alert(t('cannotDeleteBooked'));
      return;
    }

    // Confirm deletion
    if (!confirm(t('deleteSlotConfirm'))) {
      return;
    }

    const slotId = `${slot.startAt}-${slot.endAt}`;
    setDeletingSlotId(slotId);
    setOpenPopoverId(null);

    try {
      await deleteAvailabilityBySlot(slot, userId);
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['availability-slots'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['availabilities'],
      });
    } catch (error) {
      console.error('Error deleting availability:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('deleteError');
      alert(errorMessage);
    } finally {
      setDeletingSlotId(null);
    }
  };

  const handleStopRecurrence = async (slot: AvailabilitySlot) => {
    if (!userId) return;

    // Prevent stopping recurrence if slot is booked
    if (!slot.isAvailable && slot.mission) {
      alert(t('cannotDeleteBooked'));
      return;
    }

    // Confirm action
    if (!confirm(t('stopRecurrenceConfirm'))) {
      return;
    }

    const slotId = `${slot.startAt}-${slot.endAt}`;
    setStoppingRecurrenceId(slotId);
    setOpenPopoverId(null);

    try {
      await stopRecurrenceForSlot(slot, userId);
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['availability-slots'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['availabilities'],
      });
    } catch (error) {
      console.error('Error stopping recurrence:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('stopRecurrenceError');
      alert(errorMessage);
    } finally {
      setStoppingRecurrenceId(null);
    }
  };

  const dayNames = [
    tCommon('days.monday'),
    tCommon('days.tuesday'),
    tCommon('days.wednesday'),
    tCommon('days.thursday'),
    tCommon('days.friday'),
    tCommon('days.saturday'),
    tCommon('days.sunday'),
  ];

  // Calculate stats from real data
  const stats = {
    availableSlots: slots.filter(slot => slot.isAvailable).length,
    bookedHours: slots
      .filter(slot => !slot.isAvailable && slot.mission)
      .reduce((total, slot) => total + slot.durationMn / 60, 0),
    estimatedRevenue: slots
      .filter(slot => !slot.isAvailable && slot.mission)
      .reduce((total, slot) => total + (slot.durationMn / 60) * 0, 0), // TODO: Add hourly rate
    fillRate:
      slots.length > 0
        ? Math.round(
            (slots.filter(slot => !slot.isAvailable).length / slots.length) *
              100
          )
        : 0,
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-blue-900'>{t('title')}</h1>
        <Button
          className='border-blue-500 text-blue-700 hover:bg-blue-50'
          onClick={() => setIsEditModalOpen(true)}
          variant='outline'
        >
          <Pencil className='mr-2 h-4 w-4' />
          {t('modifyAvailabilities')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Taux de remplissage */}
        <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='p-6'>
            <h3 className='mb-2 text-sm font-medium text-gray-600'>
              {t('fillRate')}
            </h3>
            <div className='mb-3 text-3xl font-bold text-blue-900'>
              {stats.fillRate}%
            </div>
            <div className='h-2 w-full rounded-full bg-green-100'>
              <div
                className='h-2 rounded-full bg-green-500 transition-all'
                style={{ width: `${stats.fillRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Heures réservées */}
        <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-600'>
                {t('bookedHours')}
              </h3>
              <Clock className='h-5 w-5 text-gray-400' />
            </div>
            <div className='mb-1 text-3xl font-bold text-blue-900'>
              {stats.bookedHours}h
            </div>
            <p className='text-sm text-gray-500'>{t('thisWeek')}</p>
          </div>
        </Card>

        {/* Créneaux disponibles */}
        <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-600'>
                {t('availableSlots')}
              </h3>
              <TrendingUp className='h-5 w-5 text-green-500' />
            </div>
            <div className='mb-1 text-3xl font-bold text-green-600'>
              {stats.availableSlots}
            </div>
            <p className='text-sm text-gray-500'>{t('toBook')}</p>
          </div>
        </Card>

        {/* Revenus estimés */}
        <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-600'>
                {t('estimatedRevenue')}
              </h3>
              <DollarSign className='h-5 w-5 text-gray-400' />
            </div>
            <div className='mb-1 text-3xl font-bold text-blue-900'>
              {stats.estimatedRevenue}€
            </div>
            <p className='text-sm text-gray-500'>{t('thisWeek')}</p>
          </div>
        </Card>
      </div>

      {/* Weekly Navigation */}
      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
        <Button
          className='text-gray-600 hover:text-gray-800'
          onClick={goToPreviousWeek}
          size='sm'
          variant='ghost'
        >
          <ChevronLeft className='mr-1 h-4 w-4' />
          {t('previousWeek')}
        </Button>
        <h2 className='text-lg font-bold text-blue-900'>
          {t('weekOf')} {format(weekStart, 'd MMMM yyyy', { locale: fr })}
        </h2>
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

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-3'>
        {weekDays.map((day, index) => {
          // Utiliser mounted pour éviter les différences d'hydratation
          const isToday = mounted && isSameDay(day, new Date());
          const dayName = dayNames[index];
          const dayNumber = format(day, 'd');
          const month = format(day, 'MMM', { locale: fr });

          return (
            <Card
              className={`min-h-[200px] rounded-lg border-2 bg-white shadow-sm ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              key={index}
            >
              <div className='p-4'>
                <div className='mb-1 text-sm font-bold text-blue-900'>
                  {dayName}
                </div>
                <div className='mb-4 text-sm text-blue-900'>
                  {dayNumber} {month}
                </div>
                {/* Display availability slots for this day */}
                <div className='space-y-2'>
                  {isLoading ? (
                    <div className='text-xs text-gray-500'>
                      {tCommon('messages.loading')}
                    </div>
                  ) : (
                    groupedSlots.getSlotsByDay(day).map((slot, slotIndex) => {
                      const startTime = format(new Date(slot.startAt), 'HH:mm');
                      const endTime = format(new Date(slot.endAt), 'HH:mm');
                      const isBooked = !slot.isAvailable;
                      const slotId = `${slot.startAt}-${slot.endAt}`;
                      const isDeleting = deletingSlotId === slotId;
                      const isStoppingRecurrence =
                        stoppingRecurrenceId === slotId;
                      const isPopoverOpen = openPopoverId === slotId;

                      return (
                        <Popover
                          key={slotIndex}
                          onOpenChange={open =>
                            setOpenPopoverId(open ? slotId : null)
                          }
                          open={isPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <div
                              className={`cursor-pointer rounded border p-2 text-xs transition-colors hover:opacity-80 ${
                                isBooked
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : 'border-green-300 bg-green-50 text-green-700'
                              }`}
                            >
                              <div className='flex items-center justify-between gap-2'>
                                <div className='flex-1'>
                                  <div className='font-medium'>
                                    {startTime} - {endTime}
                                  </div>
                                  {isBooked && slot.mission && (
                                    <div className='mt-1 text-xs opacity-75'>
                                      {t('booked')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent align='start' className='w-56 p-2'>
                            <div className='space-y-1'>
                              {!isBooked && (
                                <>
                                  <Button
                                    className='w-full justify-start text-sm'
                                    disabled={isStoppingRecurrence}
                                    onClick={() => handleStopRecurrence(slot)}
                                    size='sm'
                                    variant='ghost'
                                  >
                                    {isStoppingRecurrence ? (
                                      <>
                                        <Clock className='mr-2 h-3 w-3 animate-spin' />
                                        {tCommon('messages.saving')}
                                      </>
                                    ) : (
                                      t('stopRecurrence')
                                    )}
                                  </Button>
                                  <Button
                                    className='w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-700'
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteSlot(slot)}
                                    size='sm'
                                    variant='ghost'
                                  >
                                    {isDeleting ? (
                                      <>
                                        <Clock className='mr-2 h-3 w-3 animate-spin' />
                                        {tCommon('messages.saving')}
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className='mr-2 h-3 w-3' />
                                        {t('deleteSlot')}
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                              {isBooked && (
                                <div className='px-2 py-1 text-xs text-gray-500'>
                                  {t('cannotDeleteBooked')}
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })
                  )}
                  {!isLoading &&
                    isFetched &&
                    groupedSlots.getSlotsByDay(day).length === 0 && (
                      <div className='text-xs text-gray-400'>
                        {t('noSlots')}
                      </div>
                    )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      <AvailabilitiesEditPage
        onClose={() => setIsEditModalOpen(false)}
        open={isEditModalOpen}
        weekStart={weekStart}
      />
    </div>
  );
}
