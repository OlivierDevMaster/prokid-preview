'use client';

import { MapPin, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProfessionalLocationInputProps {
  onChange: (value: string) => void;
  onClear: () => void;
  value: string;
}

export function ProfessionalLocationInput({
  onChange,
  onClear,
  value,
}: ProfessionalLocationInputProps) {
  const t = useTranslations('professional');

  return (
    <div className='relative focus-within:text-blue-500'>
      <Input
        className='h-9 rounded-xl bg-slate-100 pl-3 pr-12 text-xs font-medium text-slate-800 ring-0 placeholder:text-xs placeholder:text-black focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:placeholder:text-blue-500'
        onChange={e => onChange(e.target.value)}
        placeholder={t('search.locationPlaceholder')}
        value={value}
      />
      {value && (
        <Button
          className='absolute right-7 top-1/2 -translate-y-1/2 rounded-full px-1.5 text-slate-400 hover:bg-slate-100'
          onClick={onClear}
          variant='ghost'
        >
          <X className='h-4 w-4' />
        </Button>
      )}
      <MapPin className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-current' />
    </div>
  );
}
