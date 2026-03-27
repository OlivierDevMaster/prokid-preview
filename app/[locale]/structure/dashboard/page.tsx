'use client';

import { MapPin, MessageCircle, UserSearch } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { StructureDashboardConversationsSection } from '@/features/structure/dashboard/StructureDashboardConversationsSection';
import { StructureDashboardMissionsSection } from '@/features/structure/dashboard/StructureDashboardMissionsSection';
import { StructureDashboardReportsSection } from '@/features/structure/dashboard/StructureDashboardReportsSection';
import { useGetMissions } from '@/features/structure/missions/hooks/useGetMissions';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';
import { Link } from '@/i18n/routing';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

type Profile = {
  avatar_url: null | string;
  city?: null | string;
  created_at: string;
  email: string;
  first_name: null | string;
  is_onboarded: boolean;
  last_name: null | string;
  postal_code?: null | string;
  preferred_language: 'en' | 'fr';
  role: 'admin' | 'professional' | 'structure';
  user_id: string;
};

export default function DashboardPage() {
  const t = useTranslations('structure.dashboard');
  const { data: session } = useSession();
  const { handleClearSelection } = useSelectedProfessional();
  const { data: structure } = useFindStructure(session?.user?.id);

  const { data: missionsData } = useGetMissions({}, { limit: 1, page: 1 });
  const missionsCount = missionsData?.count ?? 0;

  const structureName = structure?.name || t('structureNameFallback');

  const profile = structure?.profile as null | Profile | undefined;
  const structureCity =
    profile?.city || profile?.postal_code || t('structureLocationFallback');

  useEffect(() => {
    handleClearSelection();
  }, [handleClearSelection]);

  return (
    <div className='min-h-screen bg-[#f6f6f8] text-slate-900'>
      <header className='border-b border-slate-200 bg-white px-6 py-6 md:px-10'>
        <div className='mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center'>
          <div className='flex items-center gap-5'>
            <div className='h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 shadow-sm'>
              <div className='flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-500'>
                {structureName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
                {structureName}
              </h1>
              <div className='mt-1 flex items-center gap-2 text-slate-500'>
                <MapPin className='h-4 w-4' />
                <span className='text-sm font-medium'>{structureCity}</span>
                <span className='mx-1 text-slate-300'>•</span>
                <span className='text-sm font-medium text-slate-600'>
                  {t('missionsCount', { count: missionsCount })}
                </span>
              </div>
            </div>
          </div>
          <div className='flex w-full gap-3 md:w-auto'>
            <Link className='flex-1 md:flex-none' href='/structure/chat'>
              <Button className='flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50'>
                <MessageCircle className='h-4 w-4' />
                {t('messageCta')}
              </Button>
            </Link>
            <Link className='flex-1 md:flex-none' href='/structure/search'>
              <Button className='flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4A90E2] text-sm font-semibold text-white shadow-lg shadow-[#4A90E2]/20 transition-colors hover:opacity-90'>
                <UserSearch className='h-4 w-4' />
                {t('findProCta')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='px-6 py-6 md:px-10 md:py-10'>
        <div className='mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='space-y-8 lg:col-span-8'>
            <StructureDashboardConversationsSection />
            <StructureDashboardMissionsSection />
          </div>
          <div className='space-y-8 lg:col-span-4'>
            <StructureDashboardReportsSection />
            <section className='relative overflow-hidden rounded-2xl bg-[#2C3E50] p-6 text-white shadow-lg shadow-slate-900/20'>
              <div className='relative z-10'>
                <h2 className='mb-2 text-lg font-bold'>{t('helpCardTitle')}</h2>
                <p className='mb-4 text-sm text-slate-200'>
                  {t('helpCardDescription')}
                </p>
                <span className='inline-block rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white'>
                  support@prokid.com
                </span>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
