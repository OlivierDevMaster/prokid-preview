'use client';

import { MapPin, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { generateUsernameSlug } from '@/lib/utils';

import { ProfessionalSkills } from '../professional.config';
import { Professional } from '../professional.model';

interface ProfessionalSearchCardProps {
  distanceKm?: number;
  isDefaultCase?: boolean;
  onToggleSelect?: (professional: Professional) => void;
  professional: Professional;
  selectable?: boolean;
  selected?: boolean;
}

export function ProfessionalSearchCard({
  distanceKm,
  isDefaultCase,
  onToggleSelect,
  professional,
  selectable = false,
  selected = false,
}: ProfessionalSearchCardProps) {
  const t = useTranslations('professional.card');
  const tJobs = useTranslations('professional.jobs');

  const selectableCardClasses = selectable
    ? selected
      ? 'border-2 border-blue-500 shadow-[0_12px_30px_rgba(15,23,42,0.08)]'
      : 'border-2 border-slate-200 hover:border-blue-200'
    : 'border border-slate-200';

  const username = generateUsernameSlug(
    professional.profile.first_name,
    professional.profile.last_name
  );
  const profileUrl = username
    ? `/professionals/${username}/${professional.user_id}`
    : `/professionals/${professional.user_id}`;

  const fullName = [
    professional.profile.first_name,
    professional.profile.last_name,
  ]
    .filter(Boolean)
    .join(' ');

  const currentJobKey = professional.current_job;
  const currentJobLabel =
    currentJobKey &&
    ProfessionalSkills.includes(
      currentJobKey as (typeof ProfessionalSkills)[number]
    )
      ? tJobs(currentJobKey)
      : (professional.profile.role ?? currentJobKey ?? '');

  const handleCheckboxChange = (checked: 'indeterminate' | boolean) => {
    if (!selectable || !onToggleSelect || checked === 'indeterminate') return;
    onToggleSelect(professional);
  };

  const locationLabel = (() => {
    if (isDefaultCase) {
      return professional.city ?? '';
    }

    if (typeof distanceKm !== 'number') {
      return professional.city ?? '';
    }

    if (distanceKm > 1000) {
      return professional.city ?? '';
    }

    // Show a friendly label when the professional is less than 10 meters away.
    if (distanceKm < 0.01) {
      return t('veryCloseToHome');
    }

    // Show meters for distances below 1 kilometer.
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }

    // Show kilometers for distances of 1 kilometer and more.
    return `${Math.round(distanceKm)} ${t('km')}`;
  })();

  const shouldHideToPrefix =
    !isDefaultCase &&
    typeof distanceKm === 'number' &&
    distanceKm <= 1000 &&
    distanceKm < 0.01;

  return (
    <Card
      className={cn(
        'relative flex h-full flex-col justify-between rounded-2xl border transition-shadow',
        selectableCardClasses
      )}
    >
      {selectable && (
        <div
          className='absolute right-4 top-4 z-10'
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          <Checkbox
            aria-label={selected ? t('unselect') : t('select')}
            checked={selected}
            className='size-5 border-2 border-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500'
            onCheckedChange={handleCheckboxChange}
          />
        </div>
      )}
      <Link
        className='flex h-full flex-col p-4 sm:p-6'
        href={profileUrl}
        target='_blank'
      >
        <div className='flex items-start justify-between gap-4 sm:gap-5'>
          <div className='flex flex-shrink-0 items-start gap-3'>
            <div className='relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16'>
              {professional.profile.avatar_url ? (
                <Image
                  alt={fullName || 'Professional profile photo'}
                  className='h-full w-full rounded-full object-cover'
                  height={64}
                  src={professional.profile.avatar_url}
                  unoptimized
                  width={64}
                />
              ) : (
                <span className='rounded-full text-lg font-semibold text-gray-500 sm:text-2xl'>
                  {professional.profile.first_name?.charAt(0) ?? ''}
                </span>
              )}
            </div>
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-col'>
              <h3 className='text-base font-bold text-gray-900 sm:text-lg'>
                {fullName || professional.profile.first_name}
              </h3>
              <p className='text-sm text-gray-500'>{currentJobLabel}</p>
              {/* Availability badge */}
              {professional.is_available && (
                <div className='mb-1 mt-1.5 flex items-center gap-1.5'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'>
                    <span className='size-2 rounded-full bg-emerald-500' />
                    {t('availableNow')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='flex flex-1 flex-col'>
          <div className='mt-3 flex flex-wrap items-start justify-start gap-2'>
            {(professional?.skills ?? []).slice(0, 3).map((skill, index) => (
              <Badge
                className='flex items-center rounded-full bg-gray-100 font-medium text-gray-700 hover:bg-gray-100 sm:text-xs'
                key={index}
                variant='secondary'
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className='mt-4 flex items-center justify-between gap-2 text-sm'>
          <div className='flex min-w-0 items-center gap-1.5 text-gray-600'>
            <MapPin className='h-4 w-4 flex-shrink-0 text-gray-400' />
            <span className='truncate'>
              {shouldHideToPrefix
                ? locationLabel
                : `${t('to')} ${locationLabel}`}
            </span>
          </div>
          <div className='mt-1 flex items-center gap-1.5 text-sm text-gray-600'>
            <Star className='h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400' />
            <span className='font-medium text-gray-900'>
              {professional.rating
                ? Number(professional.rating).toFixed(1)
                : '0.0'}
            </span>
            <span className='text-gray-500'>
              ({professional.reviews_count} {t('reviews')})
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
