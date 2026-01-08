'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  useProfessionalNotificationPreferences,
  useUpdateProfessionalNotificationPreferences,
} from '@/features/professional-notification-preferences/hooks';

interface NotificationPreference {
  checked: boolean;
  field: 'appointment_reminders' | 'email_notifications' | 'newsletter';
  id: string;
  label: string;
}

export function NotificationPreferences() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<{
    appointment_reminders: boolean;
    email_notifications: boolean;
    newsletter: boolean;
  } | null>(null);

  const {
    data: preferences,
    error,
    isLoading,
  } = useProfessionalNotificationPreferences(userId);
  const updateMutation = useUpdateProfessionalNotificationPreferences(userId);

  const preferenceItems: NotificationPreference[] = useMemo(() => {
    const currentPrefs =
      isEditing && localPreferences ? localPreferences : preferences;
    return [
      {
        checked: currentPrefs?.email_notifications ?? true,
        field: 'email_notifications',
        id: 'email_notifications',
        label: tAdmin('setting.notificationPreferences.emailNotifications'),
      },
      {
        checked: currentPrefs?.appointment_reminders ?? true,
        field: 'appointment_reminders',
        id: 'appointment_reminders',
        label: tAdmin('setting.notificationPreferences.appointmentReminders'),
      },
      {
        checked: currentPrefs?.newsletter ?? false,
        field: 'newsletter',
        id: 'newsletter',
        label: tAdmin('setting.notificationPreferences.newsletter'),
      },
    ];
  }, [preferences, localPreferences, isEditing, tAdmin]);

  const handleEditClick = () => {
    if (preferences) {
      setLocalPreferences({
        appointment_reminders: preferences.appointment_reminders ?? true,
        email_notifications: preferences.email_notifications ?? true,
        newsletter: preferences.newsletter ?? false,
      });
    } else {
      setLocalPreferences({
        appointment_reminders: true,
        email_notifications: true,
        newsletter: false,
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setLocalPreferences(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      await updateMutation.mutateAsync(localPreferences);
      setIsEditing(false);
      setLocalPreferences(null);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleToggle = (field: NotificationPreference['field']) => {
    if (!isEditing || !localPreferences) return;

    setLocalPreferences({
      ...localPreferences,
      [field]: !localPreferences[field],
    });
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-bold text-blue-900'>
          {tAdmin('setting.notificationPreferences.title')}
        </h2>
        <div className='text-sm text-gray-600'>{t('messages.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-bold text-blue-900'>
          {tAdmin('setting.notificationPreferences.title')}
        </h2>
        <div className='text-sm text-red-600'>
          Error loading preferences. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-blue-900'>
          {tAdmin('setting.notificationPreferences.title')}
        </h2>
        {!isEditing && (
          <Button onClick={handleEditClick} size='sm' variant='outline'>
            {t('actions.edit')}
          </Button>
        )}
      </div>

      <div className='space-y-4'>
        {preferenceItems.map(preference => (
          <div className='flex items-start gap-3' key={preference.id}>
            <Checkbox
              checked={preference.checked}
              className='mt-1'
              disabled={!isEditing || updateMutation.isPending}
              id={preference.id}
              onCheckedChange={() => handleToggle(preference.field)}
            />
            <Label
              className='flex-1 cursor-pointer text-sm text-gray-700'
              htmlFor={preference.id}
            >
              {preference.label}
            </Label>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className='flex justify-end gap-2'>
          <Button onClick={handleCancel} size='sm' variant='outline'>
            {t('actions.cancel')}
          </Button>
          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            disabled={updateMutation.isPending}
            onClick={handleSave}
            size='sm'
          >
            {updateMutation.isPending
              ? t('messages.saving')
              : t('actions.save')}
          </Button>
        </div>
      )}
    </div>
  );
}
