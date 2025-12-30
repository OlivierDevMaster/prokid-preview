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
    <div className='space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
      {/* Header */}
      <div className='flex items-center gap-2 sm:gap-4'>
        <Button
          className='h-8 w-8 sm:h-9 sm:w-9'
          onClick={() => router.back()}
          size='icon'
          variant='ghost'
        >
          <ArrowLeft className='h-4 w-4 sm:h-5 sm:w-5' />
        </Button>
        <h1 className='text-xl font-bold text-gray-900 sm:text-2xl'>
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
