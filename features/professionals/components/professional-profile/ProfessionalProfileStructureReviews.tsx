'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useRatingsForProfessional } from '@/features/structure/ratings/hooks/useRatingsForProfessional';

type ProfessionalProfileStructureReviewsProps = {
  professionalId: string;
};

export function ProfessionalProfileStructureReviews({
  professionalId,
}: ProfessionalProfileStructureReviewsProps) {
  const t = useTranslations('professional.profile');
  const { data: ratingsResult } = useRatingsForProfessional(professionalId);
  const ratings = ratingsResult?.data ?? [];

  if (ratings.length === 0) {
    return null;
  }

  return (
    <section className='flex flex-col gap-6'>
      <h3 className='px-1 text-xl font-bold'>{t('structureReviewsTitle')}</h3>
      {ratings.map((rating) => (
        <div
          className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'
          key={rating.id}
        >
          <div className='mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
            <div className='flex gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500'>
                {(rating as unknown as { structure_name?: string }).structure_name?.charAt(0) ?? '?'}
              </div>
              <div>
                <p className='font-bold'>
                  {(rating as unknown as { structure_name?: string }).structure_name ?? t('anonymousStructure')}
                </p>
                <p className='text-xs text-slate-500'>
                  {new Date(rating.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className='flex text-amber-400'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  className={`size-4 ${i < rating.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                  key={i}
                />
              ))}
            </div>
          </div>
          {rating.comment && (
            <p className='italic text-slate-700'>
              &ldquo;{rating.comment}&rdquo;
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
