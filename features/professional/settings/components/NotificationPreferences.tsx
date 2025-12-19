'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface NotificationPreference {
  checked: boolean;
  id: string;
  label: string;
}

export function NotificationPreferences() {
  const tAdmin = useTranslations('admin');
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      checked: true,
      id: 'appointment_reminders',
      label: tAdmin('setting.notificationPreferences.appointmentReminders'),
    },
    {
      checked: true,
      id: 'new_interventions',
      label: tAdmin('setting.notificationPreferences.newInterventions'),
    },
    {
      checked: false,
      id: 'report_confirmation',
      label: tAdmin('setting.notificationPreferences.reportConfirmation'),
    },
    {
      checked: false,
      id: 'newsletter',
      label: tAdmin('setting.notificationPreferences.newsletter'),
    },
  ]);

  const handleToggle = (id: string) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, checked: !pref.checked } : pref
      )
    );
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-bold text-blue-900'>
        {tAdmin('setting.notificationPreferences.title')}
      </h2>

      <div className='space-y-4'>
        {preferences.map(preference => (
          <div className='flex items-start gap-3' key={preference.id}>
            <Checkbox
              checked={preference.checked}
              className='mt-1'
              id={preference.id}
              onCheckedChange={() => handleToggle(preference.id)}
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
