'use client';

import { CalendarCheck, CheckCircle2, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { cn } from '@/lib/utils';

import { translateProfessionalJob } from './professional-profile-job';

type ProfessionalProfileHeroCardProps = {
  professionalId: string;
};

export function ProfessionalProfileHeroCard({
  professionalId,
}: ProfessionalProfileHeroCardProps) {
  const t = useTranslations('professional.profile');
  const tProfessional = useTranslations('professional');
  const { data: professional } = useFindProfessional(professionalId);

  if (!professional) {
    return null;
  }

  const firstName = professional.profile.first_name ?? '';
  const lastName = professional.profile.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || '—';
  const skills = professional.skills ?? [];
  const description = professional.description?.trim() || '';
  const ratingDisplay = professional.rating
    ? Number(professional.rating).toFixed(1)
    : null;
  const reviewsCount = professional.reviews_count ?? 0;
  const jobTitle = translateProfessionalJob(professional.current_job, tProfessional) || '';

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
      <div className='flex flex-col items-start gap-6 md:flex-row'>
        <div className='size-32 shrink-0 overflow-hidden rounded-2xl shadow-xl'>
          {professional.profile.avatar_url ? (
            <Image
              alt={fullName}
              className='size-full object-cover'
              height={128}
              src={professional.profile.avatar_url}
              unoptimized
              width={128}
            />
          ) : (
            <div className='flex size-full items-center justify-center bg-slate-200 text-3xl font-bold text-slate-500'>
              {firstName?.charAt(0)}
              {lastName?.charAt(0)}
            </div>
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
            <div>
              <h2 className='text-2xl font-bold text-slate-900 sm:text-3xl'>
                {fullName}
              </h2>
              <p className='text-lg font-semibold text-[#4A90E2]'>{jobTitle}</p>
              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold',
                    professional.is_available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  <CalendarCheck className='size-4 shrink-0' />
                  {professional.is_available
                    ? t('availableImmediately')
                    : t('unavailable')}
                </span>
                {professional.is_certified ? (
                  <span className='flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700'>
                    <CheckCircle2 className='size-3.5 shrink-0' />
                    {t('verifiedShort')}
                  </span>
                ) : null}
              </div>
            </div>
            {ratingDisplay && (
            <div className='flex shrink-0 items-center gap-1 text-amber-500'>
              <Star className='size-6 fill-amber-500 text-amber-500' />
              <span className='text-xl font-bold'>{ratingDisplay}</span>
              <span className='ml-1 text-sm font-normal text-slate-400'>
                ({reviewsCount} {t('reviews')})
              </span>
            </div>
            )}
          </div>
        </div>
      </div>
      <div>
        {description && (
          <p className='mt-4 leading-relaxed text-slate-600'>{description}</p>
        )}
        {skills.length > 0 && (
          <div className='mt-6 flex flex-wrap gap-3'>
            {skills.map(skill => (
              <span
                className='rounded-lg bg-[#CDEAE1] px-3 py-1.5 text-sm font-medium text-slate-700'
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
