'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ProfessionalProfileStructureReviewsProps = {
  professionalId: string;
};

/**
 * Structure reviews for this professional. Currently mock UI; wire to API when available.
 */
export function ProfessionalProfileStructureReviews({
  professionalId,
}: ProfessionalProfileStructureReviewsProps) {
  const t = useTranslations('professional.profile');
  void professionalId;

  return (
    <section className='flex flex-col gap-6'>
      <h3 className='px-1 text-xl font-bold'>{t('structureReviewsTitle')}</h3>
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
          <div className='flex gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500'>
              MD
            </div>
            <div>
              <p className='font-bold'>{t('mockReviewerName')}</p>
              <p className='text-xs text-slate-500'>
                {t('mockReviewerRole')} • {t('mockReviewTime')}
              </p>
            </div>
          </div>
          <div className='flex text-amber-400'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star className='size-4 fill-amber-400 text-amber-400' key={i} />
            ))}
          </div>
        </div>
        <p className='italic text-slate-700'>
          &ldquo;{t('mockReviewQuote')}&rdquo;
        </p>
      </div>
    </section>
  );
}
