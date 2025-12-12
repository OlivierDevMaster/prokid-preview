'use client';

import Image from 'next/image';

import { Card } from '@/components/ui/card';

import type { StructureProfessionalCard } from '../modeles/professional.modele';

interface ProfessionalCardProps {
  professional: StructureProfessionalCard;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const initials = professional.name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex flex-col items-center gap-4'>
        {/* Profile Picture */}
        <div className='relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
          {professional.avatarUrl ? (
            <Image
              alt={professional.name}
              className='h-full w-full object-cover'
              height={80}
              src={professional.avatarUrl}
              unoptimized
              width={80}
            />
          ) : (
            <span className='text-2xl font-semibold text-gray-600'>
              {initials}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className='text-center text-lg font-semibold text-gray-900'>
          {professional.name}
        </h3>

        {/* Location */}
        <p className='text-center text-sm text-gray-600'>
          {professional.location}
        </p>

        {/* Skills/Tags */}
        {professional.skills && professional.skills.length > 0 && (
          <div className='flex flex-wrap justify-center gap-2'>
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
    </Card>
  );
}
