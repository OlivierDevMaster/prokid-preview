'use client';

import { useTranslations } from 'next-intl';

import { ProfessionalsCard } from '@/features/professionals/components/ProfessionalsCard';
import { Professional } from '@/features/professionals/professional.model';

import { useFindProfessionals } from '../hooks/useFindProfessionals';

interface RelatedProfessionalsProps {
  currentProfessional: Professional;
}

export function RelatedProfessionals({
  currentProfessional,
}: RelatedProfessionalsProps) {
  const t = useTranslations('professional.profile');

  // Find related professionals by same job type or location
  const { data: relatedData } = useFindProfessionals(
    {
      current_job: currentProfessional.current_job || undefined,
      locationSearch: currentProfessional.city || undefined,
    },
    { limit: 4 }
  );

  const relatedProfessionals =
    relatedData?.data?.filter(
      prof => prof.user_id !== currentProfessional.user_id
    ) || [];

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
