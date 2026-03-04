'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={cn('p-3', className)}
      classNames={{
        caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-sm font-medium',
        cell: 'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        day_disabled: 'text-muted-foreground opacity-50',
        day_hidden: 'invisible',
        day_outside:
          'text-muted-foreground opacity-50 aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        head_cell:
          'w-9 text-[0.8rem] font-normal text-muted-foreground rounded-md',
        head_row: 'flex',
        month: 'space-y-4',
        months: 'flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0',
        nav: 'flex items-center space-x-1',
        nav_button:
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent hover:text-accent-foreground',
        nav_button_next: 'absolute right-1',
        nav_button_previous: 'absolute left-1',
        row: 'mt-2 flex w-full',
        table: 'w-full border-collapse space-y-1',
        ...classNames,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
