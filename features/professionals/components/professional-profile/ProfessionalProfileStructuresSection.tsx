'use client';

import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';

import {
  MOCK_PARTNER_COUNT,
  MOCK_STRUCTURES,
} from './professional-profile-mock';

type ProfessionalProfileStructuresSectionProps = {
  professionalId: string;
};

export function ProfessionalProfileStructuresSection({
  professionalId,
}: ProfessionalProfileStructuresSectionProps) {
  const t = useTranslations('professional.profile');
  const { data: professional } = useFindProfessional(professionalId);

  const { moreCount, visible } = useMemo(() => {
    const list = [...MOCK_STRUCTURES];
    return {
      moreCount: Math.max(0, MOCK_PARTNER_COUNT - 3),
      visible: list.slice(0, 3),
    };
  }, []);

  const firstName = professional?.profile.first_name ?? '';

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='mb-6'>
        <div className='mb-1 flex items-center gap-2'>
          <span aria-hidden className='text-xl'>
            🤝
          </span>
          <h4 className='text-sm font-bold uppercase tracking-wider text-slate-900'>
            {t('structuresWithProfessional', { firstName })}
          </h4>
        </div>
        <p className='ml-8 text-sm font-medium text-slate-500'>
          {t('partnerStructuresCount', { count: MOCK_PARTNER_COUNT })}
        </p>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
        {visible.map(s => (
          <div
            className='group flex cursor-default items-center gap-3 rounded-xl border border-slate-100 bg-[#f8fafc] p-3 transition-all hover:border-[#4A90E2]/30'
            key={s.name}
          >
            <div className='flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-200'>
              <Building2 className='size-4 text-slate-400' />
            </div>
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-slate-900'>
                {s.name}
              </p>
              <p className='text-[11px] uppercase tracking-tight text-slate-500'>
                {t('missionsLabel', { count: s.missions })}
              </p>
            </div>
          </div>
        ))}
        {moreCount > 0 ? (
          <button
            className='flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#4A90E2]/20 bg-[#4A90E2]/5 p-3 text-[#4A90E2] transition-all hover:bg-[#4A90E2]/10'
            type='button'
          >
            <span className='truncate text-sm font-bold'>
              {t('viewMoreStructures', { count: moreCount })}
            </span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
