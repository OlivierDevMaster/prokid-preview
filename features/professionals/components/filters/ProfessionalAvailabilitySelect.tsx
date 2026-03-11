'use client';

import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

interface ProfessionalAvailabilitySelectProps {
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  open: boolean;
  value: string;
}

export function ProfessionalAvailabilitySelect({
  onOpenChange,
  onValueChange,
  open,
  value,
}: ProfessionalAvailabilitySelectProps) {
  const t = useTranslations('professional');

  return (
    <Select
      onOpenChange={onOpenChange}
      onValueChange={onValueChange}
      open={open}
      value={value}
    >
      <SelectTrigger className='h-9 rounded-xl border border-slate-200 bg-slate-100 px-4 text-xs font-medium text-slate-800 shadow-none hover:bg-slate-100 data-[state=open]:border-blue-500 data-[state=open]:bg-blue-50 data-[state=open]:text-blue-500 [&>svg]:hidden'>
        <div className='flex w-full items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <span>{t('search.availability')}</span>
          </div>
          <CalendarDays className='h-4 w-4 text-current' />
        </div>
      </SelectTrigger>
      <SelectContent className='min-w-[220px] rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg'>
        <SelectItem
          className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 data-[state=checked]:bg-blue-50'
          value='all'
        >
          {t('availability.all')}
        </SelectItem>
        <SelectItem
          className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 data-[state=checked]:bg-blue-50'
          value='morning'
        >
          {t('availability.morning')}
        </SelectItem>
        <SelectItem
          className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 data-[state=checked]:bg-blue-50'
          value='afternoon'
        >
          {t('availability.afternoon')}
        </SelectItem>
        <SelectItem
          className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 data-[state=checked]:bg-blue-50'
          value='fullDay'
        >
          {t('availability.fullDay')}
        </SelectItem>
        <SelectItem
          className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 data-[state=checked]:bg-blue-50'
          value='weekend'
        >
          {t('availability.weekend')}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
