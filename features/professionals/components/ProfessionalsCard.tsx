'use client';

import { Calendar, Eye, MapPin, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

import { Professional } from '../professional.model';

interface ProfessionalsCardProps {
  professional: Professional;
}

export function ProfessionalsCard({ professional }: ProfessionalsCardProps) {
  const t = useTranslations('professional.card');

  return (
    <Card className='rounded-lg border border-green-100/50 bg-white shadow-sm transition-shadow hover:shadow-md'>
      <div className='p-6'>
        <div className='flex gap-4'>
          <div className='flex-shrink-0'>
            <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
              {professional.profile.avatar_url ? (
                // TODO: Check if width and height are correct
                <Image
                  alt={professional.profile.first_name ?? ''}
                  className='h-full w-full object-cover'
                  height={64}
                  src={professional.profile.avatar_url}
                  unoptimized
                  width={64}
                />
              ) : (
                <span className='text-2xl font-semibold text-gray-500'>
                  {professional.profile.first_name?.charAt(0) ?? ''}
                </span>
              )}
            </div>
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-stretch justify-between gap-4'>
              <div className='flex-1'>
                <h3 className='mb-1 text-lg font-bold text-gray-800'>
                  {professional.profile.first_name}
                </h3>
                <p className='mb-3 text-sm font-medium text-blue-600'>
                  {professional.profile.role}
                </p>

                <div className='mb-3 space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='h-4 w-4 text-gray-400' />
                    <span>
                      {professional.city} • {t('upTo')}{' '}
                      {professional.intervention_radius_km} {t('km')}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span>
                      {professional.is_available
                        ? t('available')
                        : t('unavailable')}
                    </span>
                  </div>
                </div>

                <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
                  {professional.description}
                </p>

                <div className='mb-3 flex flex-wrap gap-2'>
                  {(professional?.skills ?? []).map((skill, index) => (
                    <Badge
                      className='bg-green-500 text-white hover:bg-green-600'
                      key={index}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className='align-end flex flex-col justify-between text-right'>
                <div className='flex items-center justify-end gap-2 text-sm text-gray-600'>
                  <Star className='h-4 w-4 fill-yellow-500 text-yellow-500' />
                  <span className='font-semibold text-yellow-500'>
                    {professional.rating
                      ? Number(professional.rating).toFixed(1)
                      : '0.0'}
                  </span>
                  <span className='text-gray-500'>
                    ({professional.reviews_count || 0})
                  </span>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-sm text-gray-800'>
                    {professional.hourly_rate}€{t('hourlyRate')}
                  </p>
                  <Link href={`/professionals/${professional.user_id}`}>
                    <Button
                      className='w-full rounded-lg bg-blue-500 text-white hover:bg-blue-600'
                      size='sm'
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      {t('viewProfile')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
