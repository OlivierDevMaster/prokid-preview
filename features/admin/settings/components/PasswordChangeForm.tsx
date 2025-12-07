'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordChangeForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className='space-y-4 border-t border-gray-200 pt-6'>
      <h2 className='text-lg font-bold text-blue-900'>
        {tAdmin('setting.changePassword')}
      </h2>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='currentPassword'
          >
            {t('label.currentPassword')}
          </Label>
          <div className='relative'>
            <Input
              className='w-full pr-10'
              id='currentPassword'
              placeholder={t('placeholder.currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
            />
            <Button
              className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              size='icon'
              type='button'
              variant='ghost'
            >
              {showCurrentPassword ? (
                <EyeOff className='h-4 w-4 text-gray-500' />
              ) : (
                <Eye className='h-4 w-4 text-gray-500' />
              )}
            </Button>
          </div>
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='newPassword'
          >
            {t('label.newPassword')}
          </Label>
          <div className='relative'>
            <Input
              className='w-full pr-10'
              id='newPassword'
              placeholder={t('placeholder.newPassword')}
              type={showNewPassword ? 'text' : 'password'}
            />
            <Button
              className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
              onClick={() => setShowNewPassword(!showNewPassword)}
              size='icon'
              type='button'
              variant='ghost'
            >
              {showNewPassword ? (
                <EyeOff className='h-4 w-4 text-gray-500' />
              ) : (
                <Eye className='h-4 w-4 text-gray-500' />
              )}
            </Button>
          </div>
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='confirmPassword'
          >
            {t('label.confirmPassword')}
          </Label>
          <div className='relative'>
            <Input
              className='w-full pr-10'
              id='confirmPassword'
              placeholder={t('placeholder.confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
            />
            <Button
              className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              size='icon'
              type='button'
              variant='ghost'
            >
              {showConfirmPassword ? (
                <EyeOff className='h-4 w-4 text-gray-500' />
              ) : (
                <Eye className='h-4 w-4 text-gray-500' />
              )}
            </Button>
          </div>
        </div>

        <div className='space-y-1 pt-2'>
          <p className='text-sm text-gray-600'>
            {tAdmin('setting.passwordRequirements.title')}
          </p>
          <ul className='list-inside list-disc space-y-1 text-sm text-gray-500'>
            <li>{tAdmin('setting.passwordRequirements.length')}</li>
            <li>{tAdmin('setting.passwordRequirements.uppercase')}</li>
            <li>{tAdmin('setting.passwordRequirements.number')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
