'use client';

import { Card } from '@/components/ui/card';

import { NotificationPreferences } from './NotificationPreferences';
import { PasswordChangeForm } from './PasswordChangeForm';
import { PersonalInfoForm } from './PersonalInfoForm';

export function ProfileTabContent() {
  return (
    <div className='space-y-6'>
      <Card className='rounded-lg border border-gray-200 bg-white p-6'>
        <PersonalInfoForm />
      </Card>

      <Card className='rounded-lg border border-gray-200 bg-white p-6'>
        <PasswordChangeForm />
      </Card>

      <Card className='rounded-lg border border-gray-200 bg-white p-6'>
        <NotificationPreferences />
      </Card>
    </div>
  );
}
