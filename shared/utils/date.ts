import { addDays, differenceInCalendarDays } from 'date-fns';

export function getDurationInDays(startDate: Date, endDate: Date): number {
  return differenceInCalendarDays(endDate, startDate) + 1;
}

export function getEndDate(startDate: Date, numberOfDays: number): Date {
  return addDays(startDate, numberOfDays);
}
