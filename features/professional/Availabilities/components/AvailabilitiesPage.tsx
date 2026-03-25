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
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';

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

  // Fetch professional data to get hourly rate
  const { data: professional } = useFindProfessional(userId || undefined);

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleDeleteSlotClick = (slot: AvailabilitySlot) => {
    // Prevent deletion if slot is booked
    if (!slot.isAvailable && slot.mission) {
      toast.error(t('cannotDeleteBooked'));
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(t('deleteError'));
    } finally {
      setDeletingSlotId(null);
    }
  };

  const handleStopRecurrenceClick = (slot: AvailabilitySlot) => {
    // Prevent stopping recurrence if slot is booked
    if (!slot.isAvailable && slot.mission) {
      toast.error(t('cannotDeleteBooked'));
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
          ? t('notRecurrenceMessage')
          : errorMessage,
        open: true,
        title: isNotRecurrenceError ? t('notRecurrenceTitle') : t('errorTitle'),
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
  const stats = useMemo(() => {
    const availableSlots = slots.filter(slot => slot.isAvailable).length;
    const bookedSlots = slots.filter(slot => !slot.isAvailable && slot.mission);
    const bookedHours = bookedSlots.reduce(
      (total, slot) => total + slot.durationMn / 60,
      0
    );
    const hourlyRate = professional?.hourly_rate || 0;
    const estimatedRevenue = bookedSlots.reduce(
      (total, slot) => total + (slot.durationMn / 60) * hourlyRate,
      0
    );
    const unavailableSlots = slots.filter(slot => !slot.isAvailable).length;
    const fillRate =
      slots.length > 0
        ? Math.round((unavailableSlots / slots.length) * 100)
        : 0;

    return {
      availableSlots,
      bookedHours,
      estimatedRevenue,
      fillRate,
    };
  }, [slots, professional?.hourly_rate]);

  return (
    <div className='space-y-4 bg-white p-4 p-8 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='text-2xl font-bold text-blue-900 sm:text-3xl'>
          {t('title')}
        </h1>
        <Button
          className='h-10 w-full rounded-xl border-blue-500 text-blue-700 hover:bg-blue-50 sm:w-auto'
          onClick={() => setIsEditModalOpen(true)}
          variant='outline'
        >
          <Pencil className='mr-2 h-4 w-4' />
          {t('modifyAvailabilities')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4'>
        {/* Taux de remplissage */}
        <Card className='rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='p-4 sm:p-6'>
            <h3 className='mb-2 text-xs font-medium text-gray-600 sm:text-sm'>
              {t('fillRate')}
            </h3>
            <div className='mb-3 text-2xl font-bold text-blue-900 sm:text-3xl'>
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
        <Card className='rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='p-4 sm:p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-xs font-medium text-gray-600 sm:text-sm'>
                {t('bookedHours')}
              </h3>
              <Clock className='h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
            </div>
            <div className='mb-1 text-2xl font-bold text-blue-900 sm:text-3xl'>
              {stats.bookedHours}h
            </div>
            <p className='text-xs text-gray-500 sm:text-sm'>{t('thisWeek')}</p>
          </div>
        </Card>

        {/* Créneaux disponibles */}
        <Card className='rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='p-4 sm:p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-xs font-medium text-gray-600 sm:text-sm'>
                {t('availableSlots')}
              </h3>
              <TrendingUp className='h-4 w-4 text-green-500 sm:h-5 sm:w-5' />
            </div>
            <div className='mb-1 text-2xl font-bold text-green-600 sm:text-3xl'>
              {stats.availableSlots}
            </div>
            <p className='text-xs text-gray-500 sm:text-sm'>{t('toBook')}</p>
          </div>
        </Card>

        {/* Revenus estimés */}
        <Card className='rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='p-4 sm:p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-xs font-medium text-gray-600 sm:text-sm'>
                {t('estimatedRevenue')}
              </h3>
              <DollarSign className='h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
            </div>
            <div className='mb-1 text-2xl font-bold text-blue-900 sm:text-3xl'>
              {stats.estimatedRevenue}€
            </div>
            <p className='text-xs text-gray-500 sm:text-sm'>{t('thisWeek')}</p>
          </div>
        </Card>
      </div>

      {/* Weekly Navigation */}
      <div className='rounded-xl border border-slate-200 bg-white p-3 sm:p-4'>
        <div className='mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-4'>
          <Button
            className='text-gray-600 hover:text-gray-800'
            onClick={goToPreviousWeek}
            size='sm'
            variant='ghost'
          >
            <ChevronLeft className='h-4 w-4 sm:mr-1' />
            <span className='hidden sm:inline'>{t('previousWeek')}</span>
          </Button>
          <h2 className='flex-1 text-center text-sm font-bold text-blue-900 sm:text-base lg:text-lg'>
            <span className='hidden sm:inline'>
              {t('weekOf')} {format(weekStart, 'd MMMM yyyy', { locale: fr })}
            </span>
            <span className='sm:hidden'>
              {format(weekStart, 'd MMM yyyy', { locale: fr })}
            </span>
          </h2>
          <Button
            className='text-gray-600 hover:text-gray-800'
            onClick={goToNextWeek}
            size='sm'
            variant='ghost'
          >
            <span className='hidden sm:inline'>{t('nextWeek')}</span>
            <ChevronRight className='h-4 w-4 sm:ml-1' />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
          {weekDays.map((day, index) => {
            // Utiliser mounted pour éviter les différences d'hydratation
            const isToday = mounted && isSameDay(day, new Date());
            const dayName = dayNames[index];
            const dayNumber = format(day, 'd');
            const month = format(day, 'MMM', { locale: fr });

            return (
              <Card
                className={`min-h-[150px] rounded-xl border-2 bg-white shadow-sm sm:min-h-[180px] lg:min-h-[200px] ${
                  isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                }`}
                key={index}
              >
                <div className='p-3 sm:p-4'>
                  <div className='mb-1 text-xs font-bold text-blue-900 sm:text-sm'>
                    {dayName}
                  </div>
                  <div className='mb-3 text-xs text-blue-900 sm:mb-4 sm:text-sm'>
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
              className='h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => setInfoModal({ ...infoModal, open: false })}
              variant='default'
            >
              {tCommon('actions.ok')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
