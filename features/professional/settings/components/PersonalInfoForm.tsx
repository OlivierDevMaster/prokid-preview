'use client';

import { Camera, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useUpdateProfessional } from '@/features/professionals/hooks/useUpdateProfessional';
import { useUpdateProfile } from '@/features/profiles/hooks/useUpdateProfile';
import {
  deleteProfilePhoto,
  uploadProfilePhoto,
} from '@/features/profiles/profile.service';

export function PersonalInfoForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [imagePreview, setImagePreview] = useState<null | string>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfileMutation = useUpdateProfile();
  const updateProfessionalMutation = useUpdateProfessional();

  const { data: professional } = useFindProfessional(session?.user?.id);

  const currentFirstName = professional?.profile?.first_name || '';
  const currentLastName = professional?.profile?.last_name || '';
  const currentPhone = professional?.phone || '';
  const currentAvatarUrl = professional?.profile?.avatar_url || null;

  const handleUpdateClick = () => {
    setFirstName(currentFirstName);
    setLastName(currentLastName);
    setPhone(currentPhone);
    setImagePreview(null);
    setSelectedFile(null);
    setShouldRemoveImage(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setImagePreview(null);
    setSelectedFile(null);
    setShouldRemoveImage(false);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveSelectedImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingImage = () => {
    setShouldRemoveImage(true);
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id || !professional) {
      return;
    }

    const hasFormChanges =
      firstName !== currentFirstName ||
      lastName !== currentLastName ||
      phone !== currentPhone;
    const hasImageChange = selectedFile !== null;
    const hasImageRemoval = shouldRemoveImage && currentAvatarUrl !== null;

    if (!hasFormChanges && !hasImageChange && !hasImageRemoval) {
      setIsEditing(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    setIsUploadingImage(true);
    try {
      const updatePromises = [];
      const profileUpdates: {
        avatar_url?: null | string;
        first_name?: string;
        last_name?: string;
      } = {};

      if (firstName !== currentFirstName || lastName !== currentLastName) {
        profileUpdates.first_name = firstName.trim();
        profileUpdates.last_name = lastName.trim();
      }

      if (shouldRemoveImage && currentAvatarUrl) {
        await deleteProfilePhoto(currentAvatarUrl);
        profileUpdates.avatar_url = null;
      } else if (selectedFile) {
        if (currentAvatarUrl) {
          await deleteProfilePhoto(currentAvatarUrl);
        }
        const avatarUrl = await uploadProfilePhoto(
          selectedFile,
          session.user.id
        );
        profileUpdates.avatar_url = avatarUrl;
      }

      if (Object.keys(profileUpdates).length > 0) {
        updatePromises.push(
          updateProfileMutation.mutateAsync({
            updateData: profileUpdates,
            userId: session.user.id,
          })
        );
      }

      if (phone !== currentPhone) {
        updatePromises.push(
          updateProfessionalMutation.mutateAsync({
            professionalId: session.user.id,
            updateData: {
              phone: phone.trim() || null,
            },
          })
        );
      }

      await Promise.all(updatePromises);
      setImagePreview(null);
      setSelectedFile(null);
      setShouldRemoveImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const displayImage =
    imagePreview || (!shouldRemoveImage ? currentAvatarUrl : null);
  const initials =
    `${currentFirstName.charAt(0) || ''}${currentLastName.charAt(0) || ''}`.toUpperCase();

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

      <div className='space-y-2'>
        <Label className='text-sm font-medium text-gray-700'>
          {t('label.profileImage')}
        </Label>
        <div className='flex items-center gap-4'>
          <div className='relative flex-shrink-0'>
            <div className='relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-200 ring-2 ring-white'>
              {displayImage ? (
                <Image
                  alt='Profile'
                  className='h-full w-full object-cover'
                  height={96}
                  src={displayImage}
                  unoptimized
                  width={96}
                />
              ) : (
                <span className='text-2xl font-semibold text-gray-500'>
                  {initials}
                </span>
              )}
            </div>
            {isEditing && (
              <>
                <Button
                  className='absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-500 p-0 hover:bg-blue-600'
                  onClick={handleCameraClick}
                  size='sm'
                  type='button'
                >
                  <Camera className='h-4 w-4 text-white' />
                </Button>
                {(imagePreview || (currentAvatarUrl && !shouldRemoveImage)) && (
                  <Button
                    className='absolute right-0 top-0 h-6 w-6 rounded-full bg-red-500 p-0 hover:bg-red-600'
                    onClick={
                      imagePreview
                        ? handleRemoveSelectedImage
                        : handleRemoveExistingImage
                    }
                    size='sm'
                    type='button'
                  >
                    <X className='h-3 w-3 text-white' />
                  </Button>
                )}
                <input
                  accept='image/*'
                  className='hidden'
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  type='file'
                />
              </>
            )}
          </div>
          {isEditing && imagePreview && (
            <p className='text-sm text-gray-600'>
              {t('messages.imageSelected')}
            </p>
          )}
        </div>
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
              updateProfileMutation.isPending ||
              updateProfessionalMutation.isPending ||
              isUploadingImage ||
              !firstName.trim() ||
              !lastName.trim()
            }
            onClick={handleSave}
            size='sm'
          >
            {updateProfileMutation.isPending ||
            updateProfessionalMutation.isPending ||
            isUploadingImage
              ? t('messages.saving')
              : t('actions.save')}
          </Button>
        </div>
      )}
    </div>
  );
}
