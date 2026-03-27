'use client';

import { Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { useRatingsForProfessional } from '@/features/structure/ratings/hooks/useRatingsForProfessional';

export default function ReceivedReviewsSection() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';
  const { data: ratingsResult } = useRatingsForProfessional(userId);
  const ratings = ratingsResult?.data ?? [];

  return (
    <section className='rounded-xl bg-white p-6 shadow-sm'>
      <h2 className='mb-4 flex items-center gap-2 text-xl font-bold'>
        <Star className='size-6 text-blue-600' />
        Avis reçus
        {ratings.length > 0 && (
          <span className='text-base font-normal text-slate-400'>
            ({ratings.length})
          </span>
        )}
      </h2>

      {ratings.length === 0 ? (
        <p className='py-4 text-sm text-slate-400'>
          Aucun avis reçu pour le moment. Les structures pourront vous noter après chaque mission.
        </p>
      ) : (
        <div className='space-y-4'>
          {ratings.map(rating => (
            <div
              className='rounded-xl border border-slate-100 bg-slate-50 p-4'
              key={rating.id}
            >
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-sm font-semibold text-slate-900'>
                    {(rating as unknown as { structure_name?: string }).structure_name || 'Structure'}
                  </p>
                  <p className='text-xs text-slate-400'>
                    {new Date(rating.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className='flex'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      className={`h-4 w-4 ${i < rating.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                      key={i}
                    />
                  ))}
                </div>
              </div>
              {rating.comment && (
                <p className='mt-2 text-sm italic text-slate-600'>
                  &ldquo;{rating.comment}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
