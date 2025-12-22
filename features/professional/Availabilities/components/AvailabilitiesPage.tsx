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
  TrendingUp,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { AvailabilitySlot } from '@/features/availabilities/availability.model';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ConfirmModal from '@/features/components/ConfirmModal';

import {
  deleteAvailabilityBySlot,
  stopRecurrenceForSlot,
} from '../availabilities.service';
import { useGetAvailabilities } from '../hooks/useGetAvailabilities';
import AvailabilitiesEditPage from './AvailabilitiesEditPage';
import AvailabilitySlotComponent from './AvailabilitySlot';

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
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    slot: AvailabilitySlot | null;
    type: 'delete' | 'stopRecurrence' | null;
  }>({
    open: false,
    slot: null,
    type: null,
  });
  const [infoModal, setInfoModal] = useState<{
    message: string;
    open: boolean;
    title: string;
  }>({
    message: '',
    open: false,
    title: '',
  });

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

  const handleDeleteSlotClick = (slot: AvailabilitySlot) => {
    // Prevent deletion if slot is booked
    if (!slot.isAvailable && slot.mission) {
      alert(t('cannotDeleteBooked'));
      return;
    }

    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      slot,
      type: 'delete',
    });
    setOpenPopoverId(null);
  };

  const handleDeleteSlot = async (slot: AvailabilitySlot) => {
    if (!userId) return;

    const slotId = `${slot.startAt}-${slot.endAt}`;
    setDeletingSlotId(slotId);
    setConfirmDialog({ open: false, slot: null, type: null });

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

  const handleStopRecurrenceClick = (slot: AvailabilitySlot) => {
    // Prevent stopping recurrence if slot is booked
    if (!slot.isAvailable && slot.mission) {
      alert(t('cannotDeleteBooked'));
      return;
    }

    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      slot,
      type: 'stopRecurrence',
    });
    setOpenPopoverId(null);
  };

  const handleStopRecurrence = async (slot: AvailabilitySlot) => {
    if (!userId) return;

    const slotId = `${slot.startAt}-${slot.endAt}`;
    setStoppingRecurrenceId(slotId);
    setConfirmDialog({ open: false, slot: null, type: null });

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

      // Check if the error indicates the slot is not a recurrence
      const isNotRecurrenceError =
        errorMessage.toLowerCase().includes('recurring') ||
        errorMessage.toLowerCase().includes('recurrence') ||
        errorMessage.toLowerCase().includes('not a recurring');

      setInfoModal({
        message: isNotRecurrenceError
          ? t('notRecurrenceMessage') ||
            'This slot is not part of a recurring availability. Only recurring slots can have their recurrence stopped.'
          : errorMessage,
        open: true,
        title: isNotRecurrenceError
          ? t('notRecurrenceTitle') || 'Not a Recurring Slot'
          : t('errorTitle') || 'Error',
      });
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
    <div className='space-y-6 bg-blue-50/30 p-8'>
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
      <div className='rounded-lg border border-gray-200 bg-white p-4'>
        <div className='mb-4 flex items-center justify-between'>
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
                        const slotId = `${slot.startAt}-${slot.endAt}`;
                        const isPopoverOpen = openPopoverId === slotId;

                        return (
                          <AvailabilitySlotComponent
                            deletingSlotId={deletingSlotId}
                            isPopoverOpen={isPopoverOpen}
                            key={slotIndex}
                            onDeleteClick={handleDeleteSlotClick}
                            onOpenChange={open =>
                              setOpenPopoverId(open ? slotId : null)
                            }
                            onStopRecurrenceClick={handleStopRecurrenceClick}
                            slot={slot}
                            stoppingRecurrenceId={stoppingRecurrenceId}
                            t={t}
                            tCommon={tCommon}
                          />
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
      </div>

      {/* Edit Modal */}
      <AvailabilitiesEditPage
        onClose={() => setIsEditModalOpen(false)}
        open={isEditModalOpen}
        weekStart={weekStart}
      />
      <ConfirmModal
        cancelButtonText={tCommon('actions.cancel')}
        confirmButtonText={
          confirmDialog.type === 'delete'
            ? t('deleteSlot')
            : t('stopRecurrence')
        }
        description={
          confirmDialog.type === 'delete'
            ? t('deleteSlotConfirm')
            : t('stopRecurrenceConfirm')
        }
        onCancel={() =>
          setConfirmDialog({ open: false, slot: null, type: null })
        }
        onConfirm={() => {
          if (confirmDialog.slot) {
            if (confirmDialog.type === 'delete') {
              handleDeleteSlot(confirmDialog.slot);
            } else if (confirmDialog.type === 'stopRecurrence') {
              handleStopRecurrence(confirmDialog.slot);
            }
          }
        }}
        onOpenChange={open =>
          setConfirmDialog({
            open,
            slot: confirmDialog.slot,
            type: confirmDialog.type,
          })
        }
        open={confirmDialog.open}
        title={
          confirmDialog.type === 'delete'
            ? t('deleteSlot')
            : t('stopRecurrence')
        }
        type={confirmDialog.type}
      />

      {/* Info Modal */}
      <Dialog
        onOpenChange={open => setInfoModal({ ...infoModal, open })}
        open={infoModal.open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoModal.title}</DialogTitle>
            <DialogDescription>{infoModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              onClick={() => setInfoModal({ ...infoModal, open: false })}
              variant='default'
            >
              {tCommon('actions.ok') || 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
