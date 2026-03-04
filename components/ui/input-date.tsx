'use client';

import { format, isValid, parse } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';

export type InputDateProps = {
  defaultDate?: Date;
  fullWidth?: boolean;
  id: string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
};

export function InputDate({
  defaultDate,
  fullWidth,
  id,
  onChange,
  placeholder = 'jj/mm/aaaa',
}: InputDateProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    defaultDate
  );
  const [inputValue, setInputValue] = React.useState<string>(
    formatDateForInput(defaultDate)
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const nextValue = event.target.value;
    setInputValue(nextValue);

    const parsedDate = parseInputToDate(nextValue);
    if (parsedDate) {
      setSelectedDate(parsedDate);
      if (onChange) {
        onChange(parsedDate);
      }
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleSelect = (date: Date | undefined): void => {
    setSelectedDate(date);
    setInputValue(formatDateForInput(date));
    if (onChange) {
      onChange(date);
    }
    setOpen(false);
  };

  return (
    <div className={`relative w-full ${fullWidth ? '' : 'max-w-[160px]'}`}>
      <Input
        className='w-full rounded-xl border border-blue-100 bg-blue-50/40 pl-4 pr-9 text-sm placeholder:text-gray-400'
        id={id}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        value={inputValue}
      />
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <button
            aria-label='Sélectionner une date'
            className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500'
            id={`${id}-trigger`}
            type='button'
          >
            <CalendarDays className='h-4 w-4' />
            <span className='sr-only'>Sélectionner une date</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align='end'
          className='w-auto overflow-hidden p-0'
          sideOffset={8}
        >
          <Calendar
            mode='single'
            onSelect={handleSelect}
            selected={selectedDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function formatDateForInput(date: Date | undefined): string {
  if (!date || !isValid(date)) {
    return '';
  }

  return format(date, DISPLAY_DATE_FORMAT);
}

function parseInputToDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parse(value, DISPLAY_DATE_FORMAT, new Date());
  if (!isValid(parsed)) {
    return undefined;
  }

  return parsed;
}
