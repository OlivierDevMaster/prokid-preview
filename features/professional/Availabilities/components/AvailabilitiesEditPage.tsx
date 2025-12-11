'use client';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

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
import { saveWeekAvailabilities } from '../availabilities.service';
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

          return {
            end: format(endDate, 'HH:mm'),
            start: format(startDate, 'HH:mm'),
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
      }
    }
  }, [open, weekStart]);

  // Initialize schedule when data is ready and dialog is open
  useEffect(() => {
    if (!open || initialized || !initializeSchedule) return;
    setSchedule(initializeSchedule);
    setInitialized(true);
  }, [initializeSchedule, initialized, open]);

  const dayLabels = [
    tCommon('days.monday'),
    tCommon('days.tuesday'),
    tCommon('days.wednesday'),
    tCommon('days.thursday'),
    tCommon('days.friday'),
    tCommon('days.saturday'),
    tCommon('days.sunday'),
  ];

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
    setSchedule({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: [...schedule[dayKey].slots, { end: '17:00', start: '09:00' }],
      },
    });
  };

  const handleRemoveSlot = (dayKey: string, slotIndex: number) => {
    if (!schedule) return;
    setSchedule(prevSchedule => {
      const newSchedule = { ...prevSchedule };
      newSchedule[dayKey].slots[slotIndex].isDeleted = true;
      return newSchedule;
    });
  };

  const handleSlotChange = (
    dayKey: string,
    slotIndex: number,
    field: 'end' | 'start',
    value: string
  ) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: schedule[dayKey].slots.map((slot: TimeSlot, idx: number) =>
          idx === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    });
  };

  const handleSave = async () => {
    if (!userId || !schedule) {
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
    } catch (error) {
      console.error('Error saving availabilities:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : tCommon('messages.errorSaving');
      alert(errorMessage);
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
          <div>Loading...</div>
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
                            <div
                              className='grid grid-cols-2 items-end gap-4'
                              key={slotIndex}
                            >
                              <div className='space-y-2'>
                                <Label className='text-sm text-gray-700'>
                                  {tCommon('label.start')}
                                </Label>
                                <div className='relative'>
                                  <Input
                                    className='border-gray-300 pr-10'
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
                              <div className='space-y-2'>
                                <Label className='text-sm text-gray-700'>
                                  {tCommon('label.end')}
                                </Label>
                                <div className='relative flex items-center gap-2'>
                                  <div className='relative flex-1'>
                                    <Input
                                      className='border-gray-300 pr-10'
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
                                  {daySchedule.slots.length > 1 && (
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
                                  )}
                                </div>
                              </div>
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
            className='bg-blue-600 text-white hover:bg-blue-700'
            disabled={isSaving}
            onClick={handleSave}
            type='button'
          >
            {isSaving ? tCommon('messages.saving') : tCommon('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
