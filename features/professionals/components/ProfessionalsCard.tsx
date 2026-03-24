'use client';

import { Calendar, Eye, MapPin, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { generateUsernameSlug } from '@/lib/utils';

import { Professional } from '../professional.model';

interface ProfessionalsCardProps {
  professional: Professional;
}

export function ProfessionalsCard({ professional }: ProfessionalsCardProps) {
  const t = useTranslations('professional.card');

  const username = generateUsernameSlug(
    professional.profile.first_name,
    professional.profile.last_name
  );
  const profileUrl = username
    ? `/professionals/${username}/${professional.user_id}`
    : `/professionals/${professional.user_id}`;

  return (
    <Card className='rounded-lg border border-green-100/50 bg-white shadow-sm transition-shadow hover:shadow-md'>
      <div className='p-4 sm:p-6'>
        {/* Header: avatar + name + rating */}
        <div className='mb-3 flex gap-3 sm:gap-4'>
          <div className='flex-shrink-0'>
            <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 sm:h-16 sm:w-16'>
              {professional.profile.avatar_url ? (
                <Image
                  alt={
                    `${professional.profile.first_name || ''} ${professional.profile.last_name || ''}`.trim() ||
                    'Professional profile photo'
                  }
                  className='h-full w-full object-cover'
                  height={64}
                  src={professional.profile.avatar_url}
                  unoptimized
                  width={64}
                />
              ) : (
                <span className='text-lg font-semibold text-gray-500 sm:text-2xl'>
                  {professional.profile.first_name?.charAt(0) ?? ''}
                </span>
              )}
            </div>
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-base font-bold text-gray-800 sm:text-lg'>
                  {professional.profile.first_name}
                </h3>
                <p className='text-xs font-medium text-blue-600 sm:text-sm'>
                  {professional.profile.role}
                </p>
              </div>
              <div className='flex items-center gap-1.5 text-xs text-gray-600 sm:text-sm'>
                <Star className='h-3 w-3 fill-yellow-500 text-yellow-500 sm:h-4 sm:w-4' />
                <span className='font-semibold text-yellow-500'>
                  {professional.rating
                    ? Number(professional.rating).toFixed(1)
                    : '0.0'}
                </span>
                <span className='text-gray-500'>
                  ({professional.reviews_count || 0})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className='mb-2 space-y-1.5 sm:mb-3 sm:space-y-2'>
          <div className='flex items-center gap-1.5 text-xs text-gray-600 sm:gap-2 sm:text-sm'>
            <MapPin className='h-3 w-3 text-gray-400 sm:h-4 sm:w-4' />
            <span className='truncate'>
              {professional.city} • {t('upTo')}{' '}
              {professional.intervention_radius_km} {t('km')}
            </span>
          </div>
          <div className='flex items-center gap-1.5 text-xs text-gray-600 sm:gap-2 sm:text-sm'>
            <Calendar className='h-3 w-3 text-gray-400 sm:h-4 sm:w-4' />
            <span>
              {professional.is_available
                ? t('available')
                : t('unavailable')}
            </span>
          </div>
        </div>

        <p className='mb-2 line-clamp-2 text-xs text-gray-600 sm:mb-3 sm:text-sm'>
          {professional.description}
        </p>

        {/* Skills */}
        <div className='mb-3 flex flex-wrap gap-1.5 sm:gap-2'>
          {(professional?.skills ?? []).map((skill, index) => (
            <Badge
              className='bg-green-500 text-xs text-white hover:bg-green-600 sm:text-sm'
              key={index}
            >
              {skill}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <div className='flex justify-end border-t border-gray-100 pt-3'>
          <Link href={profileUrl} target='_blank'>
            <Button
              className='rounded-lg bg-blue-500 text-white hover:bg-blue-600'
              size='sm'
            >
              <Eye className='mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4' />
              <span className='text-xs sm:text-sm'>
                {t('viewProfile')}
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
