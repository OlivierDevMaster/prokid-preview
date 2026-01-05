'use client';

import { useQueryClient } from '@tanstack/react-query';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { AVAILABILITIES_DAY_NAMES } from '../availabilities.config';
import { DaySchedule, TimeSlot } from '../availabilities.model';
import {
  deleteAvailabilityBySlot,
  saveWeekAvailabilities,
  stopRecurrenceForSlot,
  stopRecurrenceForSlotUntil,
} from '../availabilities.service';
import { useGetAvailabilities } from '../hooks/useGetAvailabilities';

type AvailabilitiesEditPageProps = {
  onClose: () => void;
  open: boolean;
  weekStart: Date;
};

export default function AvailabilitiesEditPage({
  onClose,
  open,
  weekStart,
}: AvailabilitiesEditPageProps) {
  const tAvailabilities = useTranslations('admin.availabilities');
  const tCommon = useTranslations('common');
  const tAuthProfessional = useTranslations('auth.signUp.professionalForm');
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id || '';

  // Ensure component is mounted on client to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize weekStartDate to prevent infinite loops
  const weekStartTimestamp = weekStart.getTime();
  const weekStartDate = useMemo(
    () => startOfWeek(weekStart, { weekStartsOn: 1 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStartTimestamp]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i)),
    [weekStartDate]
  );

  const { groupedSlots, isLoading } = useGetAvailabilities(weekStart);

  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [slotErrors, setSlotErrors] = useState<
    Record<string, Record<number, null | string>>
  >({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    dayKey: string;
    deletionType: 'recurringExclude' | 'recurringStop' | 'single';
    slotIndex: number;
  } | null>(null);

  const initializeSchedule: Record<string, DaySchedule> | undefined =
    useMemo(() => {
      if (isLoading || !groupedSlots) {
        return;
      }

      const res: Record<string, DaySchedule> = {};

      AVAILABILITIES_DAY_NAMES.forEach((dayKey: string, index: number) => {
        const day = weekDays[index];
        const daySlots = groupedSlots.getSlotsByDay(day);

        // Convert AvailabilitySlot[] to TimeSlot[]
        const timeSlots: TimeSlot[] = daySlots.map(slot => {
          const startDate = parseISO(slot.startAt);
          const endDate = parseISO(slot.endAt);
          const startTime = format(startDate, 'HH:mm');
          const endTime = format(endDate, 'HH:mm');

          return {
            end: endTime,
            originalSlot: slot,
            recurring: slot.isRecurring, // Use the property directly from the slot
            start: startTime,
          };
        });

        res[dayKey] = {
          enabled: timeSlots.length > 0,
          recurring: false,
          slots:
            timeSlots.length > 0
              ? timeSlots
              : [{ end: '17:00', start: '09:00' }],
        };
      });

      return res;
    }, [isLoading, groupedSlots, weekDays]);

  // Track previous weekStart to detect changes
  const prevWeekStartRef = useRef<null | number>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setSchedule(undefined);
      setSlotErrors({});
      prevWeekStartRef.current = null;
    }
  }, [open]);

  // Reset state when weekStart changes while dialog is open
  useEffect(() => {
    const currentWeekStartTime = weekStart.getTime();
    if (open) {
      if (prevWeekStartRef.current === null) {
        // First time opening with this weekStart
        prevWeekStartRef.current = currentWeekStartTime;
      } else if (prevWeekStartRef.current !== currentWeekStartTime) {
        // WeekStart changed while dialog is open
        prevWeekStartRef.current = currentWeekStartTime;
        setInitialized(false);
        setSchedule(undefined);
        setSlotErrors({});
      }
    }
  }, [open, weekStart]);

  const dayLabels = [
    tCommon('days.monday'),
    tCommon('days.tuesday'),
    tCommon('days.wednesday'),
    tCommon('days.thursday'),
    tCommon('days.friday'),
    tCommon('days.saturday'),
    tCommon('days.sunday'),
  ];

  /**
   * Validate slots for a specific day and return errors
   */
  const validateDaySlots = useCallback(
    (dayKey: string, slots: TimeSlot[]): Record<number, null | string> => {
      /**
       * Convert time string (HH:MM) to minutes since midnight
       */
      const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      /**
       * Check if two time slots overlap
       * Two slots overlap if: slot1.start < slot2.end && slot1.end > slot2.start
       */
      const doSlotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
        const start1 = timeToMinutes(slot1.start);
        const end1 = timeToMinutes(slot1.end);
        const start2 = timeToMinutes(slot2.start);
        const end2 = timeToMinutes(slot2.end);

        // Check if start time is before end time (valid slot)
        if (start1 >= end1 || start2 >= end2) {
          return false;
        }

        // Check overlap: slot1.start < slot2.end && slot1.end > slot2.start
        return start1 < end2 && end1 > start2;
      };

      const errors: Record<number, null | string> = {};

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];

        // Skip deleted slots
        if (slot.isDeleted) {
          continue;
        }

        const startMinutes = timeToMinutes(slot.start);
        const endMinutes = timeToMinutes(slot.end);

        // Check if start time is before end time
        if (startMinutes >= endMinutes) {
          errors[i] = tAuthProfessional('errorSlotInvalidTime');
          continue;
        }

        // Check for overlaps with other slots
        for (let j = 0; j < slots.length; j++) {
          if (
            i !== j &&
            !slots[j].isDeleted &&
            doSlotsOverlap(slot, slots[j])
          ) {
            errors[i] = tAuthProfessional('errorSlotOverlap');
            break;
          }
        }
      }

      return errors;
    },
    [tAuthProfessional]
  );

  /**
   * Check if there are any validation errors across all days
   */
  const hasValidationErrors = (): boolean => {
    return Object.values(slotErrors).some(dayErrors =>
      Object.values(dayErrors).some(error => error !== null)
    );
  };

  // Initialize schedule when data is ready and dialog is open
  useEffect(() => {
    if (!open || initialized || !initializeSchedule) return;
    setSchedule(initializeSchedule);
    setInitialized(true);

    // Validate initial schedule
    const initialErrors: Record<string, Record<number, null | string>> = {};
    AVAILABILITIES_DAY_NAMES.forEach(dayKey => {
      if (initializeSchedule[dayKey].enabled) {
        initialErrors[dayKey] = validateDaySlots(
          dayKey,
          initializeSchedule[dayKey].slots
        );
      }
    });
    setSlotErrors(initialErrors);
  }, [initializeSchedule, initialized, open, validateDaySlots]);

  const handleDayToggle = (dayKey: string) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        enabled: !schedule[dayKey].enabled,
      },
    });
  };

  const handleAddSlot = (dayKey: string) => {
    if (!schedule) return;
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: [...schedule[dayKey].slots, { end: '17:00', start: '09:00' }],
      },
    };
    setSchedule(newSchedule);

    // Validate slots after adding
    const errors = validateDaySlots(dayKey, newSchedule[dayKey].slots);
    setSlotErrors(prev => ({
      ...prev,
      [dayKey]: errors,
    }));
  };

  const handleRemoveSlot = (dayKey: string, slotIndex: number) => {
    if (!schedule) return;

    const slot = schedule[dayKey].slots[slotIndex];
    const originalSlot = slot.originalSlot;

    // Determine deletion type
    let deletionType: 'recurringExclude' | 'recurringStop' | 'single' =
      'single';

    if (originalSlot) {
      // Check if it's a single availability (daily with COUNT=1)
      const isSingleAvailability =
        originalSlot.rrule?.includes('COUNT=1') &&
        originalSlot.rrule?.includes('FREQ=DAILY');

      // Check if it's from a recurring availability
      const isFromRecurring = originalSlot.isRecurring;

      // Check if recurring checkbox is checked
      const recurringChecked = slot.recurring === true;

      if (isSingleAvailability) {
        deletionType = 'single';
      } else if (isFromRecurring && !recurringChecked) {
        deletionType = 'recurringExclude';
      } else if (isFromRecurring && recurringChecked) {
        deletionType = 'recurringStop';
      } else {
        deletionType = 'single';
      }
    }

    setDeleteConfirmation({ dayKey, deletionType, slotIndex });
  };

  const handleConfirmDelete = async () => {
    if (!schedule || !deleteConfirmation) return;

    const { dayKey, slotIndex } = deleteConfirmation;
    const slot = schedule[dayKey].slots[slotIndex];
    const originalSlot = slot.originalSlot;

    if (!originalSlot) {
      // If no original slot, just mark as deleted (new slot)
      setSchedule(prevSchedule => {
        const newSchedule = { ...prevSchedule };
        newSchedule[dayKey].slots[slotIndex].isDeleted = true;

        const errors = validateDaySlots(dayKey, newSchedule[dayKey].slots);
        setSlotErrors(prev => ({
          ...prev,
          [dayKey]: errors,
        }));

        return newSchedule;
      });
      setDeleteConfirmation(null);
      return;
    }

    setIsDeleting(true);
    try {
      // Check if it's a single availability (daily with COUNT=1)
      const isSingleAvailability =
        originalSlot.rrule?.includes('COUNT=1') &&
        originalSlot.rrule?.includes('FREQ=DAILY');

      // Check if it's from a recurring availability
      const isFromRecurring = originalSlot.isRecurring;

      // Check if recurring checkbox is checked
      const recurringChecked = slot.recurring === true;

      if (isSingleAvailability) {
        // Case 1: Single availability (daily with count = 1) → delete directly
        await deleteAvailabilityBySlot(originalSlot, userId);
      } else if (isFromRecurring && !recurringChecked) {
        // Case 2: Recurring availability without recurring checkbox → exclude single date
        await deleteAvailabilityBySlot(originalSlot, userId);
      } else if (isFromRecurring && recurringChecked) {
        // Case 3: Recurring availability with recurring checkbox
        // Check if availability has a mission
        if (originalSlot.mission && originalSlot.mission.mission_dtstart) {
          // Stop recurring from selected date till mission start
          // Parse the mission start date
          const missionStart = parseISO(originalSlot.mission.mission_dtstart);

          // Stop recurrence until mission start (day before mission start)
          // This allows the recurrence to resume after the mission
          const untilDate = new Date(missionStart);
          untilDate.setDate(untilDate.getDate() - 1);
          untilDate.setHours(23, 59, 59, 999);

          await stopRecurrenceForSlotUntil(originalSlot, userId, untilDate);
        } else {
          // No mission: try to delete, otherwise stop recurring definitively
          try {
            await deleteAvailabilityBySlot(originalSlot, userId, true);
          } catch {
            // If deletion fails, stop recurring definitively
            await stopRecurrenceForSlot(originalSlot, userId);
          }
        }
      } else {
        // Fallback: try to delete
        await deleteAvailabilityBySlot(originalSlot, userId);
      }

      // Mark slot as deleted in UI
      setSchedule(prevSchedule => {
        const newSchedule = { ...prevSchedule };
        newSchedule[dayKey].slots[slotIndex].isDeleted = true;

        const errors = validateDaySlots(dayKey, newSchedule[dayKey].slots);
        setSlotErrors(prev => ({
          ...prev,
          [dayKey]: errors,
        }));

        return newSchedule;
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: ['availability-slots'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['availabilities'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['recurring-availabilities'],
      });

      toast.success(tAvailabilities('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error(tAvailabilities('deleteError'));
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation(null);
    }
  };

  const handleSlotChange = (
    dayKey: string,
    slotIndex: number,
    field: 'end' | 'recurring' | 'start',
    value: boolean | string
  ) => {
    if (!schedule) return;
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: schedule[dayKey].slots.map((slot: TimeSlot, idx: number) =>
          idx === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    };
    setSchedule(newSchedule);

    // Validate slots after change
    const errors = validateDaySlots(dayKey, newSchedule[dayKey].slots);
    setSlotErrors(prev => ({
      ...prev,
      [dayKey]: errors,
    }));
  };

  const handleSave = async () => {
    if (!userId || !schedule) {
      return;
    }

    // Validate all days before saving
    const allErrors: Record<string, Record<number, null | string>> = {};
    AVAILABILITIES_DAY_NAMES.forEach(dayKey => {
      if (schedule[dayKey].enabled) {
        allErrors[dayKey] = validateDaySlots(dayKey, schedule[dayKey].slots);
      }
    });
    setSlotErrors(allErrors);

    // Check if there are any errors
    const hasErrors = Object.values(allErrors).some(dayErrors =>
      Object.values(dayErrors).some(error => error !== null)
    );

    // Only proceed if there are no errors
    if (hasErrors) {
      return;
    }

    setIsSaving(true);
    try {
      await saveWeekAvailabilities({
        schedule,
        userId,
        weekDays,
      });
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['availability-slots'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['availabilities'],
      });
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(tAvailabilities('errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={open && mounted}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{tAvailabilities('modifyAvailabilities')}</DialogTitle>
          <DialogDescription>
            {tAvailabilities('weekOf')}{' '}
            {mounted && format(weekStartDate, 'd MMMM yyyy', { locale: fr })}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !schedule ? (
          <div>{tAvailabilities('loading')}</div>
        ) : (
          <div className='space-y-4'>
            {AVAILABILITIES_DAY_NAMES.map((dayKey: string, index: number) => {
              const day = weekDays[index];
              const dayLabel = dayLabels[index];
              const daySchedule = schedule[dayKey];

              return (
                <div
                  className='space-y-3 rounded-lg border border-gray-200 bg-white p-4'
                  key={dayKey}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Checkbox
                        checked={daySchedule.enabled}
                        id={dayKey}
                        onCheckedChange={() => handleDayToggle(dayKey)}
                      />
                      <Label
                        className='cursor-pointer text-lg font-bold text-gray-900'
                        htmlFor={dayKey}
                      >
                        {dayLabel} ({format(day, 'd MMM', { locale: fr })})
                      </Label>
                    </div>
                    {!daySchedule.enabled && (
                      <span className='text-sm text-gray-500'>
                        {tAvailabilities('notWorking')}
                      </span>
                    )}
                  </div>

                  {daySchedule.enabled && (
                    <div className='space-y-3 pl-8'>
                      {daySchedule.slots.map(
                        (slot: TimeSlot, slotIndex: number) =>
                          !slot.isDeleted && (
                            <div key={slotIndex}>
                              <div className='grid grid-cols-2 items-end gap-4'>
                                {/* Start Time */}
                                <div className='space-y-2'>
                                  <Label className='text-sm text-gray-700'>
                                    {tCommon('label.start')}
                                  </Label>
                                  <div className='relative'>
                                    <Input
                                      className={`pr-10 ${
                                        slotErrors[dayKey]?.[slotIndex]
                                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                          : 'border-gray-300'
                                      }`}
                                      onChange={e =>
                                        handleSlotChange(
                                          dayKey,
                                          slotIndex,
                                          'start',
                                          e.target.value
                                        )
                                      }
                                      type='time'
                                      value={slot.start}
                                    />
                                    <Clock className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                                  </div>
                                </div>
                                {/* End Time */}
                                <div className='space-y-2'>
                                  <Label className='text-sm text-gray-700'>
                                    {tCommon('label.end')}
                                  </Label>
                                  <div className='relative flex items-center gap-2'>
                                    <div className='relative flex-1'>
                                      <Input
                                        className={`pr-10 ${
                                          slotErrors[dayKey]?.[slotIndex]
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                        }`}
                                        onChange={e =>
                                          handleSlotChange(
                                            dayKey,
                                            slotIndex,
                                            'end',
                                            e.target.value
                                          )
                                        }
                                        type='time'
                                        value={slot.end}
                                      />
                                      <Clock className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                                    </div>
                                    <Button
                                      className='text-red-600 hover:text-red-700'
                                      onClick={() =>
                                        handleRemoveSlot(dayKey, slotIndex)
                                      }
                                      size='sm'
                                      type='button'
                                      variant='ghost'
                                    >
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {/* Recurring */}
                              <div className='mt-2 flex items-center gap-2'>
                                <Checkbox
                                  checked={slot.recurring ?? false}
                                  id={`recurring-${dayKey}-${slotIndex}`}
                                  onCheckedChange={checked =>
                                    handleSlotChange(
                                      dayKey,
                                      slotIndex,
                                      'recurring',
                                      checked === true
                                    )
                                  }
                                />
                                <Label
                                  className='cursor-pointer text-sm text-gray-700'
                                  htmlFor={`recurring-${dayKey}-${slotIndex}`}
                                >
                                  {tAvailabilities('recurring')}
                                </Label>
                              </div>
                              {slotErrors[dayKey]?.[slotIndex] && (
                                <p className='mt-1 text-sm text-red-600'>
                                  {slotErrors[dayKey][slotIndex]}
                                </p>
                              )}
                            </div>
                          )
                      )}
                      <Button
                        className='text-sm font-medium text-blue-500 hover:text-blue-600'
                        onClick={() => handleAddSlot(dayKey)}
                        size='sm'
                        type='button'
                        variant='ghost'
                      >
                        + {tCommon('actions.add')}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} type='button' variant='outline'>
            {tCommon('actions.cancel')}
          </Button>
          <Button
            className='bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            disabled={isSaving || hasValidationErrors()}
            onClick={handleSave}
            type='button'
          >
            {isSaving ? tCommon('messages.saving') : tCommon('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      <Dialog
        onOpenChange={open => !open && setDeleteConfirmation(null)}
        open={!!deleteConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteConfirmation?.deletionType === 'recurringStop'
                ? tAvailabilities('deleteRecurringSeriesTitle')
                : deleteConfirmation?.deletionType === 'recurringExclude'
                  ? tAvailabilities('excludeRecurringDateTitle')
                  : tAvailabilities('deleteSingleSlotTitle')}
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmation?.deletionType === 'recurringStop'
                ? tAvailabilities('deleteRecurringSeriesConfirm')
                : deleteConfirmation?.deletionType === 'recurringExclude'
                  ? tAvailabilities('excludeRecurringDateConfirm')
                  : tAvailabilities('deleteSingleSlotConfirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isDeleting}
              onClick={() => setDeleteConfirmation(null)}
              type='button'
              variant='outline'
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              className='bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              type='button'
            >
              {deleteConfirmation?.deletionType === 'recurringStop'
                ? tAvailabilities('deleteRecurringSeriesButton')
                : deleteConfirmation?.deletionType === 'recurringExclude'
                  ? tAvailabilities('excludeRecurringDateButton')
                  : tAvailabilities('deleteSingleSlotButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
