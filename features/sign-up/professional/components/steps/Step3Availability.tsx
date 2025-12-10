'use client';

import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
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

  const days = [
    { key: 'monday', label: tCommon('days.monday') },
    { key: 'tuesday', label: tCommon('days.tuesday') },
    { key: 'wednesday', label: tCommon('days.wednesday') },
    { key: 'thursday', label: tCommon('days.thursday') },
    { key: 'friday', label: tCommon('days.friday') },
    { key: 'saturday', label: tCommon('days.saturday') },
    { key: 'sunday', label: tCommon('days.sunday') },
  ];
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
    days.forEach(day => {
      if (day.key !== 'monday') {
        newSchedule[day.key] = {
          enabled: mondaySchedule.enabled,
          recurring: mondaySchedule.recurring,
          slots: [...mondaySchedule.slots],
        };
      }
    });
    form.setValue('availabilities', newSchedule);
  };

  return (
    <div className='space-y-6'>
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
                          Récurrent
                        </Label>
                      </div>
                    )}
                    {!schedule[day.key].enabled && (
                      <span className='text-sm text-gray-500'>
                        Non travaillé
                      </span>
                    )}
                  </div>
                </div>

                {schedule[day.key].enabled && (
                  <div className='space-y-3 pl-8'>
                    {schedule[day.key].slots.map((slot, slotIndex) => (
                      <div
                        className='grid grid-cols-2 items-end gap-4'
                        key={slotIndex}
                      >
                        <div className='space-y-2'>
                          <Label className='text-sm text-gray-700'>Début</Label>
                          <div className='relative'>
                            <Input
                              className='border-gray-300 pr-10'
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
                            <Clock className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <Label className='text-sm text-gray-700'>Fin</Label>
                          <div className='relative'>
                            <Input
                              className='border-gray-300 pr-10'
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
                            <Clock className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      className='text-sm font-medium text-blue-500 hover:text-blue-600'
                      onClick={() => handleAddSlot(day.key)}
                      type='button'
                    >
                      + Ajouter un créneau
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
          ← Précédent
        </Button>
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600'
          onClick={onNext}
          type='button'
        >
          Suivant →
        </Button>
      </div>
    </div>
  );
}
