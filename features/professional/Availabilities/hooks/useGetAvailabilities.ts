'use client';

import { startOfWeek } from 'date-fns';
import { useSession } from 'next-auth/react';

import { useFindAvailabilitySlots } from '@/features/availabilities/hooks/useFindAvailabilitySlots';
import { useGroupedAvailabilitySlots } from '@/features/availabilities/hooks/useGroupedAvailabilitySlots';

export const useGetAvailabilities = (weekStart: Date) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Calculate week start and end dates
  const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 });
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  // Format dates as ISO strings for the API (ISO 8601 format with timezone)
  const startAt = weekStartDate.toISOString();
  const endAt = weekEndDate.toISOString();

  // Fetch availability slots for the week
  const {
    data: slots = [],
    error,
    isFetched,
    isLoading,
  } = useFindAvailabilitySlots({
    endAt,
    professionalId: userId || '',
    startAt,
  });

  // Group slots by day
  const groupedSlots = useGroupedAvailabilitySlots(slots);

  return {
    error,
    groupedSlots,
    isFetched,
    isLoading,
    slots,
    weekEnd: weekEndDate,
    weekStart: weekStartDate,
  };
};
