'use client';

import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function IdentifiersForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-bold text-blue-900'>
        {tAdmin('setting.identifiers')}
      </h2>

      <div className='space-y-2'>
        <Label className='text-sm font-medium text-gray-700' htmlFor='email'>
          {t('label.email')} *
        </Label>
        <Input
          className='w-full'
          id='email'
          placeholder='marie.joux@prokid.fr'
          type='email'
        />
      </div>
    </div>
  );
}
