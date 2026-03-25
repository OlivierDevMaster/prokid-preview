'use client';

import { Calendar, Eye, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ProfessionalCardProps {
  availability: string;
  description: string;
  distance: number;
  hourlyRate: number;
  imageUrl?: string;
  location: string;
  name: string;
  role: string;
  skills: string[];
}

export function ProfessionalCard({
  availability,
  description,
  distance,
  hourlyRate,
  imageUrl,
  location,
  name,
  role,
  skills,
}: ProfessionalCardProps) {
  const t = useTranslations('professional.card');

  return (
    <Card className='rounded-lg border border-green-100/50 bg-white shadow-sm transition-shadow hover:shadow-md'>
      <div className='p-6'>
        <div className='flex gap-4'>
          <div className='flex-shrink-0'>
            <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
              {imageUrl ? (
                // TODO: Check if width and height are correct
                <Image
                  alt={name}
                  className='h-full w-full object-cover'
                  height={64}
                  src={imageUrl}
                  width={64}
                />
              ) : (
                <span className='text-2xl font-semibold text-gray-500'>
                  {name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1'>
                <h3 className='mb-1 text-lg font-bold text-gray-800'>{name}</h3>
                <p className='mb-3 text-sm font-medium text-blue-600'>{role}</p>

                <div className='mb-3 space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='h-4 w-4 text-gray-400' />
                    <span>
                      {location} • {t('upTo')} {distance} {t('km')}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span>{availability}</span>
                  </div>
                </div>

                <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
                  {description}
                </p>

                <div className='mb-3 flex flex-wrap gap-2'>
                  {skills.map((skill) => (
                    <Badge
                      className='bg-green-500 text-white hover:bg-green-600'
                      key={skill}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className='flex-shrink-0 text-right'>
                <p className='mb-4 text-lg font-bold text-gray-800'>
                  {hourlyRate}€{t('hourlyRate')}
                </p>
                <Button className='w-full' size='sm'>
                  <Eye className='mr-2 h-4 w-4' />
                  {t('viewProfile')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
