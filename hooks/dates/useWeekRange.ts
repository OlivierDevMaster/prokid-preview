'use client';

import { endOfWeek, parseISO, startOfWeek } from 'date-fns';

export interface WeekRange {
  weekEnd: Date;
  weekStart: Date;
}

export const useWeekRange = (date: Date | string): WeekRange => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(dateObj, { weekStartsOn: 1 });

  return {
    weekEnd,
    weekStart,
  };
};
