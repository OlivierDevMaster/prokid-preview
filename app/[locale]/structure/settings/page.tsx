'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { ProfileTabContent } from '@/features/structure/settings/components/ProfileTabContent';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

export default function SettingsPage() {
  const t = useTranslations('admin');
  const searchParams = useSearchParams();
  const { handleClearSelection } = useSelectedProfessional();

  useEffect(() => {
    const emailUpdated = searchParams.get('emailUpdated');
    if (emailUpdated === 'true') {
      toast.success(t('setting.emailUpdateSuccessMessage'));
      const url = new URL(window.location.href);
      url.searchParams.delete('emailUpdated');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams, t]);

  useEffect(() => {
    handleClearSelection();
  }, [handleClearSelection]);

  return (
    <div className='min-h-screen bg-[#f6f6f8] text-slate-900'>
      <header className='border-b border-slate-200 bg-white px-6 py-6 md:px-10'>
        <div className='mx-auto max-w-3xl'>
          <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
            Paramètres
          </h1>
          <p className='mt-0.5 text-sm font-medium text-slate-500'>
            Gérez les informations de votre structure
          </p>
        </div>
      </header>

      <main className='px-6 py-8 md:px-10'>
        <div className='mx-auto max-w-3xl'>
          <ProfileTabContent />
        </div>
      </main>
    </div>
  );
}
