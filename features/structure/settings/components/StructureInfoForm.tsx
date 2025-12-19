'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';
import { useUpdateStructure } from '@/features/structures/hooks/useUpdateStructure';

export function StructureInfoForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');

  const updateStructureMutation = useUpdateStructure();

  const { data: structure } = useFindStructure(session?.user?.id);

  const currentName = structure?.name || '';

  const handleUpdateClick = () => {
    setName(currentName);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!session?.user?.id || !structure) {
      return;
    }

    if (name === currentName) {
      setIsEditing(false);
      return;
    }

    if (!name.trim()) {
      return;
    }

    try {
      await updateStructureMutation.mutateAsync({
        updateData: {
          name: name.trim(),
        },
        userId: session.user.id,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating structure info:', error);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-blue-900'>
          {tAdmin('setting.structureInformation')}
        </h2>
        {!isEditing && (
          <Button onClick={handleUpdateClick} size='sm' variant='outline'>
            {t('actions.edit')}
          </Button>
        )}
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-medium text-gray-700' htmlFor='name'>
          {tAdmin('setting.structureName')} *
        </Label>
        <Input
          className='w-full'
          disabled={!isEditing}
          id='name'
          onChange={e => setName(e.target.value)}
          placeholder='Crèche Les Petits Loups'
          readOnly={!isEditing}
          type='text'
          value={isEditing ? name : currentName}
        />
      </div>

      {isEditing && (
        <div className='flex justify-end gap-2'>
          <Button onClick={handleCancel} size='sm' variant='outline'>
            {t('actions.cancel')}
          </Button>
          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            disabled={updateStructureMutation.isPending || !name.trim()}
            onClick={handleSave}
            size='sm'
          >
            {updateStructureMutation.isPending
              ? t('messages.saving')
              : t('actions.save')}
          </Button>
        </div>
      )}
    </div>
  );
}
