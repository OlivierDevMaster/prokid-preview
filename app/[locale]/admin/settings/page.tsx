'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ProfileTabContent } from '@/features/admin/settings/components/ProfileTabContent';
import { useRouter } from '@/i18n/routing';

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations('admin');
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailUpdated = searchParams.get('emailUpdated');
    if (emailUpdated === 'true') {
      toast.success(t('setting.emailUpdateSuccessMessage'));
      // Clear the query parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('emailUpdated');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams, t]);

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

      {/* Content */}
      <div>
        <ProfileTabContent />
      </div>
    </div>
  );
}
