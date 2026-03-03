'use client';

import Image from 'next/image';

import type { Professional } from '@/features/professionals/professional.model';

type MissionRecipientProps = {
  professional: Professional;
};

export function MissionRecipient({ professional }: MissionRecipientProps) {
  const firstName = professional.profile.first_name || '';
  const lastName = professional.profile.last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();
  const displayName =
    `${firstName} ${lastName}`.trim() || professional.profile.email;

  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-blue-500 bg-blue-50 px-3 py-2'>
      <div className='relative flex items-center'>
        <div className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-100'>
          {professional.profile.avatar_url ? (
            <Image
              alt={
                `${firstName} ${lastName}`.trim() ||
                'Professional profile photo'
              }
              className='h-full w-full object-cover'
              height={32}
              src={professional.profile.avatar_url}
              unoptimized
              width={32}
            />
          ) : (
            <span className='text-xs font-semibold text-emerald-800'>
              {initials.toUpperCase()}
            </span>
          )}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
            professional.is_available ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      </div>
      <div className='flex flex-col leading-tight'>
        <span className='text-sm font-semibold text-blue-900'>
          {displayName}
        </span>
      </div>
    </div>
  );
}
