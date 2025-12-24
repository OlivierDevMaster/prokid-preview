'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/professional/schemas/professional-signup.schema';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ProgressBar } from '../ProgressBar';

export interface DaySchedule {
  enabled: boolean;
  recurring: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  end: string;
  start: string;
}

interface Step3AvailabilityProps {
  form: UseFormReturn<ProfessionalSignUpFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step3Availability({
  form,
  onNext,
  onPrevious,
}: Step3AvailabilityProps) {
  const schedule = form.watch('availabilities');
  const tCommon = useTranslations('common');
  const tAuthProfessional = useTranslations('auth.signUp.professionalForm');
  const [slotErrors, setSlotErrors] = useState<
    Record<string, Record<number, null | string>>
  >({});

  const days = [
    { key: 'monday', label: tCommon('days.monday') },
    { key: 'tuesday', label: tCommon('days.tuesday') },
    { key: 'wednesday', label: tCommon('days.wednesday') },
    { key: 'thursday', label: tCommon('days.thursday') },
    { key: 'friday', label: tCommon('days.friday') },
    { key: 'saturday', label: tCommon('days.saturday') },
    { key: 'sunday', label: tCommon('days.sunday') },
  ];

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

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  /**
   * Validate slots for a specific day and return errors
   */
  const validateDaySlots = (
    dayKey: string,
    slots: TimeSlot[]
  ): Record<number, null | string> => {
    const errors: Record<number, null | string> = {};

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const startMinutes = timeToMinutes(slot.start);
      const endMinutes = timeToMinutes(slot.end);

      // Check if start time is before end time
      if (startMinutes >= endMinutes) {
        errors[i] =
          tAuthProfessional('errorSlotInvalidTime') || 'Invalid time range';
        continue;
      }

      // Check for overlaps with other slots
      for (let j = 0; j < slots.length; j++) {
        if (i !== j && doSlotsOverlap(slot, slots[j])) {
          errors[i] =
            tAuthProfessional('errorSlotOverlap') ||
            'This slot overlaps with another';
          break;
        }
      }
    }

    return errors;
  };

  /**
   * Check if there are any validation errors across all days
   */
  const hasValidationErrors = (): boolean => {
    return Object.values(slotErrors).some(dayErrors =>
      Object.values(dayErrors).some(error => error !== null)
    );
  };
  const handleDayToggle = (dayKey: string) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        enabled: !schedule[dayKey].enabled,
      },
    };
    form.setValue('availabilities', newSchedule);
  };

  const handleAddSlot = (dayKey: string) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: [...schedule[dayKey].slots, { end: '17:00', start: '09:00' }],
      },
    };
    form.setValue('availabilities', newSchedule);

    // Validate slots after adding
    const errors = validateDaySlots(dayKey, newSchedule[dayKey].slots);
    setSlotErrors(prev => ({
      ...prev,
      [dayKey]: errors,
    }));
  };

  const handleSlotChange = (
    dayKey: string,
    slotIndex: number,
    field: 'end' | 'start',
    value: string
  ) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: schedule[dayKey].slots.map((slot, idx) =>
          idx === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    };
    form.setValue('availabilities', newSchedule);

    // Validate slots after change
    const errors = validateDaySlots(dayKey, newSchedule[dayKey].slots);
    setSlotErrors(prev => ({
      ...prev,
      [dayKey]: errors,
    }));
  };

  const handleRemoveSlot = (dayKey: string, slotIndex: number) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: schedule[dayKey].slots.filter((_, idx) => idx !== slotIndex),
      },
    };
    form.setValue('availabilities', newSchedule);

    // Validate slots after removing
    const errors = validateDaySlots(dayKey, newSchedule[dayKey].slots);
    setSlotErrors(prev => ({
      ...prev,
      [dayKey]: errors,
    }));
  };

  const handleRecurringToggle = (dayKey: string) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        recurring: !schedule[dayKey].recurring,
      },
    };
    form.setValue('availabilities', newSchedule);
  };

  const handleCopyMonday = () => {
    const mondaySchedule = schedule.monday;
    const newSchedule = { ...schedule };
    const newErrors = { ...slotErrors };

    days.forEach(day => {
      if (day.key !== 'monday') {
        newSchedule[day.key] = {
          enabled: mondaySchedule.enabled,
          recurring: mondaySchedule.recurring,
          slots: [...mondaySchedule.slots],
        };
        // Validate slots for each day after copying
        newErrors[day.key] = validateDaySlots(
          day.key,
          newSchedule[day.key].slots
        );
      }
    });
    form.setValue('availabilities', newSchedule);
    setSlotErrors(newErrors);
  };

  const handleNext = () => {
    // Validate all days before proceeding
    const allErrors: Record<string, Record<number, null | string>> = {};
    days.forEach(day => {
      if (schedule[day.key].enabled) {
        allErrors[day.key] = validateDaySlots(day.key, schedule[day.key].slots);
      }
    });
    setSlotErrors(allErrors);

    // Check if there are any errors in the newly calculated errors
    const hasErrors = Object.values(allErrors).some(dayErrors =>
      Object.values(dayErrors).some(error => error !== null)
    );

    // Only proceed if there are no errors
    if (!hasErrors) {
      onNext();
    }
  };

  return (
    <div className='w-full max-w-3xl space-y-6'>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>
          {tAuthProfessional('planningAndAvailability')}
        </h1>
        <p className='text-gray-600'>
          {tAuthProfessional('configureYourDaysAndSlots')}
        </p>
      </div>

      <Button
        className='w-full border-gray-300 text-gray-700 hover:bg-gray-50'
        onClick={handleCopyMonday}
        type='button'
        variant='outline'
      >
        {tAuthProfessional('copyMondaySchedule')}
      </Button>

      <Controller
        control={form.control}
        name='availabilities'
        render={() => (
          <div className='space-y-4'>
            {days.map(day => (
              <div
                className='space-y-4 rounded-lg border border-gray-200 bg-white p-4'
                key={day.key}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      checked={schedule[day.key].enabled}
                      id={day.key}
                      onCheckedChange={() => handleDayToggle(day.key)}
                    />
                    <Label
                      className='cursor-pointer text-lg font-bold text-gray-900'
                      htmlFor={day.key}
                    >
                      {day.label}
                    </Label>
                  </div>
                  <div className='flex items-center gap-4'>
                    {schedule[day.key].enabled && (
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          checked={schedule[day.key].recurring}
                          id={`${day.key}-recurring`}
                          onCheckedChange={() => handleRecurringToggle(day.key)}
                        />
                        <Label
                          className='cursor-pointer text-sm text-gray-700'
                          htmlFor={`${day.key}-recurring`}
                        >
                          {tAuthProfessional('recurring')}
                        </Label>
                      </div>
                    )}
                    {!schedule[day.key].enabled && (
                      <span className='text-sm text-gray-500'>
                        {tAuthProfessional('nonWorking')}
                      </span>
                    )}
                  </div>
                </div>

                {schedule[day.key].enabled && (
                  <div className='space-y-3 pl-8'>
                    {schedule[day.key].slots.map((slot, slotIndex) => (
                      <div key={slotIndex}>
                        <div className='grid grid-cols-[1fr_1fr_auto] items-end gap-4'>
                          <div className='space-y-2'>
                            <Label className='text-sm text-gray-700'>
                              Début
                            </Label>
                            <div className='relative'>
                              <Input
                                className={`w-full ${
                                  slotErrors[day.key]?.[slotIndex]
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300'
                                }`}
                                onChange={e =>
                                  handleSlotChange(
                                    day.key,
                                    slotIndex,
                                    'start',
                                    e.target.value
                                  )
                                }
                                type='time'
                                value={slot.start}
                              />
                              {/* <Clock className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' /> */}
                            </div>
                          </div>
                          <div className='space-y-2'>
                            <Label className='text-sm text-gray-700'>Fin</Label>
                            <div className='relative'>
                              <Input
                                className={`${
                                  slotErrors[day.key]?.[slotIndex]
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300'
                                }`}
                                onChange={e =>
                                  handleSlotChange(
                                    day.key,
                                    slotIndex,
                                    'end',
                                    e.target.value
                                  )
                                }
                                type='time'
                                value={slot.end}
                              />
                              {/* <Clock className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' /> */}
                            </div>
                          </div>
                          <Button
                            className='mb-0 h-10 w-10 p-0 text-gray-500 hover:bg-red-50 hover:text-red-600'
                            onClick={() => handleRemoveSlot(day.key, slotIndex)}
                            type='button'
                            variant='ghost'
                          >
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        </div>
                        {slotErrors[day.key]?.[slotIndex] && (
                          <p className='mt-1 text-sm text-red-600'>
                            {slotErrors[day.key][slotIndex]}
                          </p>
                        )}
                      </div>
                    ))}
                    <button
                      className='text-sm font-medium text-blue-500 hover:text-blue-600'
                      onClick={() => handleAddSlot(day.key)}
                      type='button'
                    >
                      {tAuthProfessional('addSlot')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      />

      <div className='flex justify-between pt-4'>
        <Button
          className='border-gray-300 text-gray-700 hover:bg-gray-50'
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          ← {tCommon('label.previous')}
        </Button>
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
          disabled={hasValidationErrors()}
          onClick={handleNext}
          type='button'
        >
          {tCommon('label.next')} →
        </Button>
      </div>
    </div>
  );
}
