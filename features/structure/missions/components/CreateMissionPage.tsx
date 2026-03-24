'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import type { Professional } from '@/features/professionals/professional.model';

import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { Link } from '@/i18n/routing';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

import { MissionPropositionForm } from './MissionPropositionForm';
import { MissionRecipient } from './MissionRecipient';

export function CreateMissionPage() {
  const t = useTranslations('structure');
  const tMissions = useTranslations('structure.missions');
  const searchParams = useSearchParams();
  const { selectedProfessionalIds, setSelectedProfessionalIds } =
    useSelectedProfessional();
  const { data } = useFindProfessionals({}, { limit: 1000, page: 1 });
  const professionalIdFromQuery = searchParams.get('professional_id');

  const allProfessionals: Professional[] = data?.data ?? [];

  useEffect(() => {
    if (!professionalIdFromQuery) return;

    setSelectedProfessionalIds(new Set([professionalIdFromQuery]));
  }, [professionalIdFromQuery, setSelectedProfessionalIds]);

  const recipients = allProfessionals.filter(professional =>
    selectedProfessionalIds.has(professional.user_id)
  );

  return (
    <div className='min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6'>
        <header className=''>
          <nav
            aria-label='Breadcrumb'
            className='flex flex-wrap items-center gap-2 text-sm text-slate-500'
          >
            <Link
              className='font-medium text-[#4A90E2] underline-offset-2 hover:underline'
              href='/structure/search'
            >
              {t('navigation.search')}
            </Link>
            <ChevronRight className='size-4 shrink-0 text-slate-400' />
            <span className='font-medium text-slate-900'>
              {tMissions('sendMission')}
            </span>
          </nav>

          <h1 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl'>
            {tMissions('sendMission')}
          </h1>

          {recipients.length > 0 && (
            <div className='mt-8 flex flex-wrap items-center gap-2 text-sm'>
              <span className='text-gray-600'>Destinataire :</span>
              <div className='flex flex-wrap gap-2'>
                {recipients.map(professional => (
                  <MissionRecipient
                    key={professional.user_id}
                    professional={professional}
                  />
                ))}
              </div>
            </div>
          )}
        </header>
        <MissionPropositionForm />
      </div>
    </div>
  );
}
