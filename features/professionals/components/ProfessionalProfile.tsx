'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import {
  ProfessionalProfileBreadcrumb,
  ProfessionalProfileCalendarSection,
  ProfessionalProfileHeroCard,
  ProfessionalProfileLoadingState,
  ProfessionalProfileNotFound,
  ProfessionalProfileSidebar,
  ProfessionalProfileStructureReviews,
  ProfessionalProfileStructuresSection,
} from '@/features/professionals/components/professional-profile';
import { RelatedProfessionals } from '@/features/professionals/components/RelatedProfessionals';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useTrackProfileView } from '@/hooks/useTrackProfileView';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const professionalId = id as string;
  const t = useTranslations('professional.profile');
  const tCommon = useTranslations('common');

  const { data: professional, isLoading } = useFindProfessional(professionalId);

  useTrackProfileView(professional?.user_id);

  if (isLoading) {
    return (
      <ProfessionalProfileLoadingState message={tCommon('messages.loading')} />
    );
  }

  if (!professional) {
    return (
      <ProfessionalProfileNotFound
        backLabel={t('backToList')}
        title={t('notFound')}
      />
    );
  }

  return (
    <div className='min-h-screen bg-[#f6f6f8] text-slate-900'>
      <div className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-8'>
        <ProfessionalProfileBreadcrumb professionalId={professionalId} />

        <div className='grid grid-cols-12 items-start gap-8'>
          <div className='col-span-12 flex flex-col gap-8 lg:col-span-8'>
            <ProfessionalProfileHeroCard professionalId={professionalId} />
            <ProfessionalProfileStructuresSection
              professionalId={professionalId}
            />
            <ProfessionalProfileStructureReviews
              professionalId={professionalId}
            />

            <RelatedProfessionals professionalId={professionalId} />
          </div>

          <ProfessionalProfileSidebar professionalId={professionalId} />
        </div>
      </div>
    </div>
  );
}
