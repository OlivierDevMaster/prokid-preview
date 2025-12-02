'use client';

import { ArrowLeft, FileText } from 'lucide-react';
import { useState } from 'react';

import BillingTabContent from '@/components/admin/settings/BillingTabContent';
import { NotificationPreferences } from '@/components/admin/settings/NotificationPreferences';
import { PasswordChangeForm } from '@/components/admin/settings/PasswordChangeForm';
import { PersonalInfoForm } from '@/components/admin/settings/PersonalInfoForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type TabType = 'disponibilites' | 'facturation' | 'profil';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profil');

  const tabs = [
    { id: 'profil' as TabType, label: 'Profil' },
    { id: 'disponibilites' as TabType, label: 'Disponibilités' },
    { id: 'facturation' as TabType, label: 'Facturation' },
  ];

  const handleSave = () => {
    console.log('Saving changes...');
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            className='h-9 w-9'
            onClick={() => router.back()}
            size='icon'
            variant='ghost'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-2xl font-bold text-gray-900'>
            Paramètres du profil
          </h1>
        </div>
        <Button
          className='bg-blue-600 text-white hover:bg-blue-700'
          onClick={handleSave}
        >
          <FileText className='mr-2 h-4 w-4' />
          Enregistrer les modifications
        </Button>
      </div>

      {/* Tabs */}
      <div className='grid grid-cols-3 gap-2 rounded-lg bg-green-300/50 p-1'>
        {tabs.map(tab => (
          <Button
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-green-50',
              activeTab === tab.id ? 'bg-green-50 text-blue-900' : ''
            )}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <Card className='rounded-lg border border-gray-200 bg-white'>
        <div className='space-y-6 p-6'>
          {activeTab === 'profil' && (
            <>
              <PersonalInfoForm />
              <PasswordChangeForm />
              <NotificationPreferences />
            </>
          )}
          {activeTab === 'disponibilites' && (
            <div className='py-12 text-center text-gray-500'>
              Section Disponibilités à venir
            </div>
          )}
          {activeTab === 'facturation' && <BillingTabContent />}
        </div>
      </Card>
    </div>
  );
}
