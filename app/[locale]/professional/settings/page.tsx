'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { ProfessionalSettingsLayout } from '@/features/professional/settings/components/ProfessionalSettingsLayout';

export default function SettingsPage() {
  const t = useTranslations('admin');
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailUpdated = searchParams.get('emailUpdated');
    if (emailUpdated === 'true') {
      toast.success(t('setting.emailUpdateSuccessMessage'));
      const url = new URL(window.location.href);
      url.searchParams.delete('emailUpdated');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams, t]);

  return <ProfessionalSettingsLayout />;
}
