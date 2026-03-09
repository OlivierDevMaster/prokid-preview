'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type DatePickerInputProps = {
  className?: string;
  fullWidth?: boolean;
  hasError?: boolean;
  id?: string;
  inputGroupClassName?: string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  value?: Date | undefined;
};

export function DatePickerInput({
  className,
  fullWidth = false,
  hasError = false,
  id,
  inputGroupClassName,
  onChange,
  placeholder = 'jj/mm/aaaa',
  value: valueProp,
}: DatePickerInputProps) {
  const isControlled = onChange !== undefined;
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    isControlled ? undefined : new Date('2025-06-01')
  );
  const date = isControlled ? valueProp : internalDate;
  const displayValue = date !== undefined ? formatDate(date) : '';
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  React.useEffect(() => {
    if (date) setMonth(date);
  }, [date]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!isControlled) setInternalDate(selectedDate);
    onChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <div className={fullWidth ? 'w-full' : undefined}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <div
            className={`cursor-pointer ${className ?? ''}`.trim()}
            onClick={() => setOpen(true)}
            ref={triggerRef}
          >
            <InputGroup className={inputGroupClassName}>
              <InputGroupInput
                aria-invalid={hasError || undefined}
                aria-label='Select date'
                id={id ?? 'date-required'}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
                placeholder={placeholder}
                readOnly
                value={displayValue}
              />
              <InputGroupAddon align='inline-end'>
                <InputGroupButton
                  aria-label='Open calendar'
                  id='date-picker'
                  size='icon-xs'
                  type='button'
                  variant='ghost'
                >
                  <CalendarIcon className='size-4' />
                  <span className='sr-only'>Open calendar</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          alignOffset={0}
          className='overflow-hidden p-0'
          sideOffset={4}
          style={
            triggerWidth !== undefined
              ? { minWidth: `${triggerWidth}px`, width: `${triggerWidth}px` }
              : undefined
          }
        >
          <Calendar
            className='w-full'
            mode='single'
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';

function formatDate(date: Date | undefined) {
  if (!date) {
    return '';
  }
  return format(date, DISPLAY_DATE_FORMAT);
}
