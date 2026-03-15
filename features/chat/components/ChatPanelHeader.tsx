'use client';

import { Building2, MapPin, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type { ViewRole } from '../types/chat.types';

export interface ChatPanelHeaderProps {
  existingRating: { id: string } | null;
  onOpenReview: () => void;
  otherPartyAddress: null | string;
  otherPartyAvatarUrl: null | string;
  otherPartyId?: string;
  otherPartyName: string;
  viewRole: ViewRole;
}

export function ChatPanelHeader({
  existingRating,
  onOpenReview,
  otherPartyAddress,
  otherPartyAvatarUrl,
  otherPartyId = '',
  otherPartyName,
  viewRole,
}: ChatPanelHeaderProps) {
  const t = useTranslations('chat');
  const isProfessional = viewRole === 'professional';

  return (
    <header className='flex items-center justify-between gap-3 border-b px-4 py-3'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        {isProfessional ? (
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted'>
            <Building2 className='h-5 w-5 text-muted-foreground' />
          </div>
        ) : (
          <div className='relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted'>
            {otherPartyAvatarUrl ? (
              <Image
                alt={otherPartyName}
                className='h-full w-full object-cover'
                height={40}
                src={otherPartyAvatarUrl}
                unoptimized
                width={40}
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center rounded-full text-sm font-medium ${
                  AVATAR_COLOR_VARIANTS[
                    getAvatarColorVariantIndex(otherPartyId)
                  ].bg
                } ${
                  AVATAR_COLOR_VARIANTS[
                    getAvatarColorVariantIndex(otherPartyId)
                  ].text
                }`}
              >
                {getInitials(otherPartyName)}
              </div>
            )}
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <h2 className='truncate font-semibold'>{otherPartyName}</h2>
          {otherPartyAddress && (
            <p className='flex items-center gap-1 truncate text-sm text-muted-foreground'>
              <MapPin className='h-3.5 w-3.5 flex-shrink-0' />
              <span className='truncate'>{otherPartyAddress}</span>
            </p>
          )}
        </div>
      </div>
      <div className='flex flex-shrink-0 items-center gap-2'>
        {viewRole === 'structure' && (
          <Button onClick={onOpenReview} size='sm' variant='outline'>
            <Star className='mr-2 h-4 w-4' />
            {existingRating ? t('updateReview') : t('leaveReview')}
          </Button>
        )}
      </div>
    </header>
  );
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map(s => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}
