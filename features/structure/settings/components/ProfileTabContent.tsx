'use client';

import { Card } from '@/components/ui/card';

import { IdentifiersForm } from './IdentifiersForm';
import { PasswordChangeForm } from './PasswordChangeForm';
import { PersonalInfoForm } from './PersonalInfoForm';
import { StructureInfoForm } from './StructureInfoForm';

export function ProfileTabContent() {
  return (
    <div className='space-y-6'>
      <Card className='rounded-lg border border-gray-200 bg-white p-6'>
        <IdentifiersForm />
      </Card>

      <Card className='rounded-lg border border-gray-200 bg-white p-6'>
        <PersonalInfoForm />
      </Card>

      <Card className='rounded-lg border border-gray-200 bg-white p-6'>
        <StructureInfoForm />
      </Card>

      <Card className='rounded-lg border border-gray-200 bg-white p-6'>
        <PasswordChangeForm />
      </Card>
    </div>
  );
}
