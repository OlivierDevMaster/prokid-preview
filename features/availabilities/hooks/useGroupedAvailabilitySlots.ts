'use client';

import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';

import type { AvailabilitySlot } from '../availability.model';

export interface GroupedAvailabilitySlots {
  getSlotsByDay: (date: Date | string) => AvailabilitySlot[];
  slotsByDay: Record<string, AvailabilitySlot[]>;
}

export const useGroupedAvailabilitySlots = (
  slots: AvailabilitySlot[]
): GroupedAvailabilitySlots => {
  const slotsByDay = useMemo(() => {
    const grouped: Record<string, AvailabilitySlot[]> = {};

    for (const slot of slots) {
      const slotDate = parseISO(slot.startAt);
      const dayKey = format(slotDate, 'yyyy-MM-dd');

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }

      grouped[dayKey].push(slot);
    }

    return grouped;
  }, [slots]);

  const getSlotsByDay = useMemo(
    () =>
      (date: Date | string): AvailabilitySlot[] => {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        const dayKey = format(dateObj, 'yyyy-MM-dd');

        return slotsByDay[dayKey] ?? [];
      },
    [slotsByDay]
  );

  return {
    getSlotsByDay,
    slotsByDay,
  };
};
