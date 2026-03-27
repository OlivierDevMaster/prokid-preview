'use client';

import { useTranslations } from 'next-intl';

import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';

type ProfessionalProfileStructuresSectionProps = {
  professionalId: string;
};

export function ProfessionalProfileStructuresSection({
  professionalId,
}: ProfessionalProfileStructuresSectionProps) {
  const t = useTranslations('professional.profile');
  const { data: professional } = useFindProfessional(professionalId);

  // No mock data - this section only renders when we have real structure partnerships
  // TODO: Implement real structure partnerships query when the feature is built
  const structures: Array<{ missions: number; name: string }> = [];

  if (structures.length === 0) {
    return null;
  }

  const firstName = professional?.profile.first_name ?? '';

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='mb-6'>
        <div className='mb-1 flex items-center gap-2'>
          <h4 className='text-sm font-bold uppercase tracking-wider text-slate-900'>
            {t('structuresWithProfessional', { firstName })}
          </h4>
        </div>
        <p className='text-sm font-medium text-slate-500'>
          {t('partnerStructuresCount', { count: structures.length })}
        </p>
      </div>
    </section>
  );
}
