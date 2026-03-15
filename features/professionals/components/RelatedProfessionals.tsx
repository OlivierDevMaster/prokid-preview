'use client';

import { useTranslations } from 'next-intl';

import { ProfessionalsCard } from '@/features/professionals/components/ProfessionalsCard';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';

import { useFindProfessionals } from '../hooks/useFindProfessionals';

type RelatedProfessionalsProps = {
  professionalId: string;
};

export function RelatedProfessionals({
  professionalId,
}: RelatedProfessionalsProps) {
  const t = useTranslations('professional.profile');
  const { data: currentProfessional } = useFindProfessional(professionalId);

  const { data: relatedData } = useFindProfessionals(
    {
      current_job: currentProfessional?.current_job || undefined,
      locationSearch: currentProfessional?.city || undefined,
    },
    { enabled: !!currentProfessional, limit: 4 }
  );

  if (!currentProfessional) {
    return null;
  }

  const relatedProfessionals =
    relatedData?.data?.filter(
      prof => prof.user_id !== currentProfessional.user_id
    ) ?? [];

  if (relatedProfessionals.length === 0) {
    return null;
  }

  return (
    <div className='mt-8'>
      <h2 className='mb-4 text-xl font-bold text-gray-800'>
        {t('relatedProfessionals') || 'Related Professionals'}
      </h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {relatedProfessionals.slice(0, 4).map(professional => (
          <ProfessionalsCard
            key={professional.user_id}
            professional={professional}
          />
        ))}
      </div>
    </div>
  );
}
