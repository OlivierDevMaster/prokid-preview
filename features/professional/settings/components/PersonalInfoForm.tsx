'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useUpdateProfessional } from '@/features/professionals/hooks/useUpdateProfessional';
import { useUpdateProfile } from '@/features/profiles/hooks';

export function PersonalInfoForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const updateProfileMutation = useUpdateProfile();
  const updateProfessionalMutation = useUpdateProfessional();
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
    if (!session?.user?.id || !professional) {
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      return;
    }
    const hasFormChanges =
      firstName !== currentFirstName ||
      lastName !== currentLastName ||
      phone !== currentPhone;
    if (!hasFormChanges) {
      setIsEditing(false);
      return;
    }
    try {
      const updatePromises = [];
      if (firstName !== currentFirstName || lastName !== currentLastName) {
        updatePromises.push(
          updateProfileMutation.mutateAsync({
            updateData: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
            userId: session.user.id,
          })
        );
      }
      if (phone !== currentPhone) {
        updatePromises.push(
          updateProfessionalMutation.mutateAsync({
            professionalId: session.user.id,
            updateData: { phone: phone.trim() || null },
          })
        );
      }
      await Promise.all(updatePromises);
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
            placeholder='Dupont'
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
            className='h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700'
            disabled={
              updateProfileMutation.isPending ||
              updateProfessionalMutation.isPending ||
              !firstName.trim() ||
              !lastName.trim()
            }
            onClick={handleSave}
            size='sm'
          >
            {updateProfileMutation.isPending ||
            updateProfessionalMutation.isPending
              ? t('messages.saving')
              : t('actions.save')}
          </Button>
        </div>
      )}
    </div>
  );
}
