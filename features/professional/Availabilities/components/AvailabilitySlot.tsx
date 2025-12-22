'use client';

import { format } from 'date-fns';
import { Clock, Repeat2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { AvailabilitySlot } from '@/features/availabilities/availability.model';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useGetStructureById } from '@/features/structures/hooks/useGetStructureById';

interface AvailabilitySlotProps {
  deletingSlotId: null | string;
  isPopoverOpen: boolean;
  onDeleteClick: (slot: AvailabilitySlot) => void;
  onOpenChange: (open: boolean) => void;
  onStopRecurrenceClick: (slot: AvailabilitySlot) => void;
  slot: AvailabilitySlot;
  stoppingRecurrenceId: null | string;
  t: ReturnType<typeof useTranslations<'admin.availabilities'>>;
  tCommon: ReturnType<typeof useTranslations<'common'>>;
}

export default function AvailabilitySlotComponent({
  deletingSlotId,
  isPopoverOpen,
  onDeleteClick,
  onOpenChange,
  onStopRecurrenceClick,
  slot,
  stoppingRecurrenceId,
  t,
  tCommon,
}: AvailabilitySlotProps) {
  const startTime = format(new Date(slot.startAt), 'HH:mm');
  const endTime = format(new Date(slot.endAt), 'HH:mm');
  const isBooked = !slot.isAvailable;
  const slotId = `${slot.startAt}-${slot.endAt}`;
  const isDeleting = deletingSlotId === slotId;
  const isStoppingRecurrence = stoppingRecurrenceId === slotId;

  const { data: structure, isLoading: isLoadingStructure } =
    useGetStructureById(slot.mission?.structure_id ?? null);

  return (
    <Popover onOpenChange={onOpenChange} open={isPopoverOpen}>
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
                <div className='mt-1 text-xs opacity-75'>{t('booked')}</div>
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
                onClick={() => onStopRecurrenceClick(slot)}
                size='sm'
                variant='ghost'
              >
                {isStoppingRecurrence ? (
                  <>
                    <Clock className='mr-2 h-3 w-3 animate-spin' />
                    {tCommon('messages.saving')}
                  </>
                ) : (
                  <>
                    <Repeat2 className='mr-2 h-3 w-3' />
                    {t('stopRecurrence')}
                  </>
                )}
              </Button>
              <Button
                className='w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-700'
                disabled={isDeleting}
                onClick={() => onDeleteClick(slot)}
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
          {isBooked && slot.mission && (
            <div className='space-y-1 px-2 py-1'>
              <div className='text-xs font-medium text-gray-700'>
                {t('mission')}: {slot.mission.title}
              </div>
              <div className='text-xs text-gray-500'>
                {t('structure')}:{' '}
                {isLoadingStructure
                  ? tCommon('messages.loading')
                  : structure?.name ||
                    structure?.profile?.first_name ||
                    slot.mission.structure_id}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
