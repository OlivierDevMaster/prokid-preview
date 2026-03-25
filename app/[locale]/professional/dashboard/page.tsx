'use client';

import { MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { AvailabilityStatusPopover } from '@/features/professional/Availabilities/components/AvailabilityStatusPopover';
import { ProfessionalDashboardConversationsSection } from '@/features/professional/dashboard/ProfessionalDashboardConversationsSection';
import { ProfessionalDashboardMissionsSection } from '@/features/professional/dashboard/ProfessionalDashboardMissionsSection';
import { ProfessionalDashboardReportsSection } from '@/features/professional/dashboard/ProfessionalDashboardReportsSection';
import { ProfileViewsStats } from '@/features/professional/stats/components/ProfileViewsStats';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { ProfessionalSkills } from '@/features/professionals/professional.config';
import { Link } from '@/i18n/routing';

export default function DashboardPage() {
  const t = useTranslations('professional.dashboard');
  const tProfessional = useTranslations('professional');
  const { data: session } = useSession();
  const { data: professional } = useFindProfessional(session?.user?.id);

  const displayName =
    professional?.profile?.first_name || professional?.profile?.last_name
      ? `${professional.profile.first_name || ''} ${professional.profile.last_name || ''}`.trim()
      : (session?.user?.name ?? '');

  const currentJob = professional?.current_job ?? '';
  const roleLabel =
    currentJob &&
    ProfessionalSkills.includes(
      currentJob as (typeof ProfessionalSkills)[number]
    )
      ? tProfessional(`jobs.${currentJob}`)
      : currentJob;

  return (
    <div className='min-h-screen bg-[#f6f6f8] text-slate-900'>
      <header className='border-b border-slate-200 bg-white px-6 py-6 md:px-10'>
        <div className='mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center'>
          <div className='flex items-center gap-5'>
            <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-amber-100 shadow-sm'>
              {professional?.profile?.avatar_url ? (
                <img
                  alt={displayName || ''}
                  className='h-full w-full object-cover'
                  src={professional.profile.avatar_url}
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-2xl font-semibold text-amber-700'>
                  {displayName.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
                {displayName || t('nameFallback')}
              </h1>
              {roleLabel && (
                <p className='mt-1 text-sm font-medium text-slate-500'>
                  {roleLabel}
                </p>
              )}
            </div>
          </div>
          <div className='flex w-full gap-3 md:w-auto'>
            <Link className='flex-1 md:flex-none' href='/professional/chat'>
              <Button className='flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#4A90E2] bg-white text-sm font-semibold text-[#4A90E2] shadow-sm transition-colors hover:bg-slate-50'>
                <MessageCircle className='h-4 w-4' />
                {t('messageCta')}
              </Button>
            </Link>
            <AvailabilityStatusPopover />
          </div>
        </div>
      </header>

      <main className='px-6 py-6 md:px-10 md:py-10'>
        <div className='mx-auto max-w-7xl space-y-8'>
          <ProfileViewsStats />
        </div>
        <div className='mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='space-y-8 lg:col-span-8'>
            <ProfessionalDashboardConversationsSection />
            <ProfessionalDashboardMissionsSection />
          </div>
          <div className='space-y-8 lg:col-span-4'>
            <ProfessionalDashboardReportsSection />
            {/* Help card - disabled for now */}
          </div>
        </div>
      </main>
    </div>
  );
}
