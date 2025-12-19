'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';

import { useUpdatePersonalInfo } from '../hooks/useUpdatePersonalInfo';

export function PersonalInfoForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const updatePersonalInfoMutation = useUpdatePersonalInfo();

  const { data: professional } = useFindProfessional(session?.user?.id);

  const currentFirstName = professional?.profile?.first_name || '';
  const currentLastName = professional?.profile?.last_name || '';
  const currentPhone = professional?.phone || '';

  const handleUpdateClick = () => {
    setFirstName(currentFirstName);
    setLastName(currentLastName);
    setPhone(currentPhone);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      return;
    }

    if (
      firstName === currentFirstName &&
      lastName === currentLastName &&
      phone === currentPhone
    ) {
      setIsEditing(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    try {
      await updatePersonalInfoMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        userId: session.user.id,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-blue-900'>
          {tAdmin('setting.personalData')}
        </h2>
        {!isEditing && (
          <Button onClick={handleUpdateClick} size='sm' variant='outline'>
            {t('actions.edit')}
          </Button>
        )}
      </div>

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
            disabled={!isEditing}
            id='firstName'
            onChange={e => setFirstName(e.target.value)}
            placeholder='Marie'
            readOnly={!isEditing}
            type='text'
            value={isEditing ? firstName : currentFirstName}
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
            disabled={!isEditing}
            id='lastName'
            onChange={e => setLastName(e.target.value)}
            placeholder='Joux'
            readOnly={!isEditing}
            type='text'
            value={isEditing ? lastName : currentLastName}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700' htmlFor='phone'>
            {t('label.phone')}
          </Label>
          <Input
            className='w-full'
            disabled={!isEditing}
            id='phone'
            onChange={e => setPhone(e.target.value)}
            placeholder='06 12 34 56 78'
            readOnly={!isEditing}
            type='tel'
            value={isEditing ? phone : currentPhone}
          />
        </div>
      </div>

      {isEditing && (
        <div className='flex justify-end gap-2'>
          <Button onClick={handleCancel} size='sm' variant='outline'>
            {t('actions.cancel')}
          </Button>
          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            disabled={
              updatePersonalInfoMutation.isPending ||
              !firstName.trim() ||
              !lastName.trim()
            }
            onClick={handleSave}
            size='sm'
          >
            {updatePersonalInfoMutation.isPending
              ? t('messages.saving')
              : t('actions.save')}
          </Button>
        </div>
      )}
    </div>
  );
}
