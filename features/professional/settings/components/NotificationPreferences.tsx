'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  useProfessionalNotificationPreferences,
  useUpdateProfessionalNotificationPreferences,
} from '@/features/professional-notification-preferences/hooks';

interface NotificationPreference {
  checked: boolean;
  field:
    | 'appointment_reminders'
    | 'new_interventions'
    | 'newsletter'
    | 'report_confirmation';
  id: string;
  label: string;
}

export function NotificationPreferences() {
  const tAdmin = useTranslations('admin');
  const {
    data: preferences,
    error,
    isLoading,
  } = useProfessionalNotificationPreferences();
  const updateMutation = useUpdateProfessionalNotificationPreferences();

  const preferenceItems: NotificationPreference[] = useMemo(
    () => [
      {
        checked: preferences?.appointment_reminders ?? true,
        field: 'appointment_reminders',
        id: 'appointment_reminders',
        label: tAdmin('setting.notificationPreferences.appointmentReminders'),
      },
      {
        checked: preferences?.new_interventions ?? true,
        field: 'new_interventions',
        id: 'new_interventions',
        label: tAdmin('setting.notificationPreferences.newInterventions'),
      },
      {
        checked: preferences?.report_confirmation ?? false,
        field: 'report_confirmation',
        id: 'report_confirmation',
        label: tAdmin('setting.notificationPreferences.reportConfirmation'),
      },
      {
        checked: preferences?.newsletter ?? false,
        field: 'newsletter',
        id: 'newsletter',
        label: tAdmin('setting.notificationPreferences.newsletter'),
      },
    ],
    [preferences, tAdmin]
  );

  const handleToggle = (field: NotificationPreference['field']) => {
    if (!preferences) return;

    const currentValue = preferences[field];
    updateMutation.mutate({
      [field]: !currentValue,
    });
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-bold text-blue-900'>
          {tAdmin('setting.notificationPreferences.title')}
        </h2>
        <div className='text-sm text-gray-600'>Loading...</div>
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
      <h2 className='text-lg font-bold text-blue-900'>
        {tAdmin('setting.notificationPreferences.title')}
      </h2>

      <div className='space-y-4'>
        {preferenceItems.map(preference => (
          <div className='flex items-start gap-3' key={preference.id}>
            <Checkbox
              checked={preference.checked}
              className='mt-1'
              disabled={updateMutation.isPending}
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
    </div>
  );
}
