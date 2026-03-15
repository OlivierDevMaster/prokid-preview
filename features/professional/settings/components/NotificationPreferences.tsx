'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useLayoutEffect, useMemo, useState } from 'react';

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

type NotificationPreferencesProps = {
  minimalDialog?: boolean;
};

export function NotificationPreferences({
  minimalDialog = false,
}: NotificationPreferencesProps) {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [isEditing, setIsEditing] = useState(minimalDialog);
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

  const defaultPrefs = useMemo(
    () => ({
      appointment_reminders: preferences?.appointment_reminders ?? true,
      email_notifications: preferences?.email_notifications ?? true,
      newsletter: preferences?.newsletter ?? false,
    }),
    [preferences]
  );

  useLayoutEffect(() => {
    if (!minimalDialog || !preferences) {
      return;
    }
    setLocalPreferences({
      appointment_reminders: preferences.appointment_reminders ?? true,
      email_notifications: preferences.email_notifications ?? true,
      newsletter: preferences.newsletter ?? false,
    });
    setIsEditing(true);
  }, [minimalDialog, preferences]);

  const preferenceItems: NotificationPreference[] = useMemo(() => {
    const currentPrefs =
      (minimalDialog || isEditing) && localPreferences
        ? localPreferences
        : preferences;
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
  }, [preferences, localPreferences, isEditing, minimalDialog, tAdmin]);

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
    if (minimalDialog) {
      setLocalPreferences({ ...defaultPrefs });
      return;
    }
    setLocalPreferences(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!localPreferences) {
      return;
    }

    try {
      await updateMutation.mutateAsync(localPreferences);
      if (!minimalDialog) {
        setIsEditing(false);
        setLocalPreferences(null);
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  };

  const handleToggle = (field: NotificationPreference['field']) => {
    const editing = minimalDialog || isEditing;
    if (!editing) {
      return;
    }
    const base =
      localPreferences ??
      (preferences
        ? {
            appointment_reminders: preferences.appointment_reminders ?? true,
            email_notifications: preferences.email_notifications ?? true,
            newsletter: preferences.newsletter ?? false,
          }
        : {
            appointment_reminders: true,
            email_notifications: true,
            newsletter: false,
          });
    setLocalPreferences({
      ...base,
      [field]: !base[field],
    });
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const canEdit = minimalDialog || isEditing;
  const showActions = minimalDialog
    ? Boolean(localPreferences ?? preferences)
    : isEditing;

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {!minimalDialog && (
          <h2 className='text-lg font-bold text-blue-900'>
            {tAdmin('setting.notificationPreferences.title')}
          </h2>
        )}
        <div className='text-sm text-gray-600'>{t('messages.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-4'>
        {!minimalDialog && (
          <h2 className='text-lg font-bold text-blue-900'>
            {tAdmin('setting.notificationPreferences.title')}
          </h2>
        )}
        <div className='text-sm text-red-600'>
          Error loading preferences. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {!minimalDialog && (
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
      )}

      <div className='space-y-4'>
        {preferenceItems.map(preference => (
          <div className='flex items-start gap-3' key={preference.id}>
            <Checkbox
              checked={preference.checked}
              className='mt-1'
              disabled={
                (!canEdit && !minimalDialog) || updateMutation.isPending
              }
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

      {showActions && (
        <div className='flex justify-end gap-2'>
          <Button onClick={handleCancel} size='sm' variant='outline'>
            {t('actions.cancel')}
          </Button>
          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            disabled={updateMutation.isPending || !localPreferences}
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
