'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordChangeForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className='space-y-4 border-t border-gray-200 pt-6'>
      <h2 className='text-lg font-bold text-blue-900'>
        Modifier le mot de passe
      </h2>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='currentPassword'
          >
            Mot de passe actuel
          </Label>
          <div className='relative'>
            <Input
              className='w-full pr-10'
              id='currentPassword'
              placeholder='Saisissez votre mot de passe actuel'
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
            Nouveau mot de passe
          </Label>
          <div className='relative'>
            <Input
              className='w-full pr-10'
              id='newPassword'
              placeholder='Minimum 8 caractères'
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
            Confirmer le nouveau mot de passe
          </Label>
          <div className='relative'>
            <Input
              className='w-full pr-10'
              id='confirmPassword'
              placeholder='Répétez le nouveau mot de passe'
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
          <p className='text-sm text-gray-600'>Exigences du mot de passe :</p>
          <ul className='list-inside list-disc space-y-1 text-sm text-gray-500'>
            <li>Au moins 8 caractères</li>
            <li>Au moins une lettre majuscule et une minuscule</li>
            <li>Au moins un chiffre</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
