'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProfessionalSearchInputProps {
  onChange: (value: string) => void;
  onClear: () => void;
  value: string;
}

export function ProfessionalSearchInput({
  onChange,
  onClear,
  value,
}: ProfessionalSearchInputProps) {
  const t = useTranslations('professional');

  return (
    <div className='relative focus-within:text-blue-500'>
      <Input
        className='h-11 rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:placeholder:text-blue-500'
        onChange={e => onChange(e.target.value)}
        placeholder={t('search.placeholder')}
        value={value}
      />
      <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-current' />
      {value && (
        <Button
          className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 text-slate-400 hover:bg-slate-200'
          onClick={onClear}
          variant='ghost'
        >
          <X className='h-4 w-4' />
        </Button>
      )}
    </div>
  );
}
