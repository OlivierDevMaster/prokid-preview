'use client';

import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface NotificationPreference {
  checked: boolean;
  id: string;
  label: string;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      checked: true,
      id: 'appointment_reminders',
      label: 'Recevoir des rappels de rendez-vous par e-mail (24h avant)',
    },
    {
      checked: true,
      id: 'new_interventions',
      label: "Recevoir les notifications de nouvelles demandes d'intervention",
    },
    {
      checked: false,
      id: 'report_confirmation',
      label: "Recevoir une confirmation d'envoi des rapports",
    },
    {
      checked: false,
      id: 'newsletter',
      label: 'Recevoir les actualités et conseils ProKid par e-mail',
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
    <div className='space-y-4 border-t border-gray-200 pt-6'>
      <h2 className='text-lg font-bold text-blue-900'>
        Préférences de notification
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
