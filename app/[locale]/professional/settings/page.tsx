'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createParser, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BillingTabContent from '@/features/professional/settings/components/BillingTabContent';
import { NotificationPreferences } from '@/features/professional/settings/components/NotificationPreferences';
import { PasswordChangeForm } from '@/features/professional/settings/components/PasswordChangeForm';
import { PersonalInfoForm } from '@/features/professional/settings/components/PersonalInfoForm';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const Tab = {
  billing: 'billing',
  profile: 'profile',
} as const;
type Tab = (typeof Tab)[keyof typeof Tab];

const tabParser = createParser({
  parse: (value: string): null | Tab => {
    if (value === Tab.profile || value === Tab.billing) {
      return value;
    }
    return null;
  },
  serialize: (value: Tab): string => value,
}).withDefault(Tab.profile);

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useQueryState('tab', tabParser);

  const tabs = [
    { id: Tab.profile, label: t('setting.profile') },
    { id: Tab.billing, label: t('setting.billing') },
  ];

  return (
    <div className='space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
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
          {t('setting.profileSettings')}
        </h1>
      </div>

      {/* Tabs */}
      <div className='grid grid-cols-2 gap-2 rounded-lg bg-green-300/50 p-1'>
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
          {activeTab === Tab.profile && (
            <>
              <PersonalInfoForm />
              <PasswordChangeForm />
              <NotificationPreferences />
            </>
          )}
          {activeTab === Tab.billing && <BillingTabContent />}
        </div>
      </Card>
    </div>
  );
}
