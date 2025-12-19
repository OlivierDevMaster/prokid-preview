'use client';

import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PersonalInfoForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-bold text-blue-900'>
        {tAdmin('setting.personalData')}
      </h2>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='firstName'
          >
            {t('label.firstName')} *
          </Label>
          <Input
            className='w-full'
            id='firstName'
            placeholder='Marie'
            type='text'
          />
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='lastName'
          >
            {t('label.lastName')} *
          </Label>
          <Input
            className='w-full'
            id='lastName'
            placeholder='Joux'
            type='text'
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700' htmlFor='phone'>
            {t('label.phone')}
          </Label>
          <Input
            className='w-full'
            id='phone'
            placeholder='06 12 34 56 78'
            type='tel'
          />
        </div>
      </div>
    </div>
  );
}
