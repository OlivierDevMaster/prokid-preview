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
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
      <Input
        className='px-10'
        onChange={e => onChange(e.target.value)}
        placeholder={t('search.placeholder')}
        value={value}
      />
      {value && (
        <Button
          className='absolute right-0 top-1/2 -translate-y-1/2'
          onClick={onClear}
          variant='ghost'
        >
          <X className='h-4 w-4' />
        </Button>
      )}
    </div>
  );
}
