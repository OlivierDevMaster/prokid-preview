'use client';

import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

import type { StructureProfessionalCard } from '../modeles/professional.modele';

interface ProfessionalCardProps {
  professional: StructureProfessionalCard;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const t = useTranslations('structure.professionals');
  const initials = professional.name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex items-start justify-start md:items-center'>
        {/* Profile Picture */}
        <div className='relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 md:h-24 md:w-24 lg:h-32 lg:w-32'>
          {professional.avatarUrl ? (
            <Image
              alt={professional.name}
              className='h-full w-full object-cover'
              height={128}
              src={professional.avatarUrl}
              unoptimized
              width={128}
            />
          ) : (
            <span className='text-sm font-semibold text-gray-600 md:text-lg lg:text-2xl'>
              {initials}
            </span>
          )}
        </div>

        <div className='p-2 pl-4 md:p-4'>
          {/* Name */}
          <h3 className='text-lg font-semibold text-gray-900'>
            {professional.name}
          </h3>

          {/* Location */}
          <p className='text-sm text-gray-600'>{professional.location}</p>

          {/* Skills/Tags */}
          <div className='pt-4'>
            {professional.skills && professional.skills.length > 0 && (
              <div className='flex flex-wrap !justify-start justify-start gap-2'>
                {professional.skills.slice(0, 5).map((skill, index) => (
                  <span
                    className='rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700'
                    key={index}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='mt-4 flex items-center justify-end'>
        <div className='flex items-center gap-2'>
          <Link href={`/structure/professionals/${professional.id}`}>
            <Button variant='outline'>
              <Eye className='h-4 w-4' />
              {t('viewProfile')}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
