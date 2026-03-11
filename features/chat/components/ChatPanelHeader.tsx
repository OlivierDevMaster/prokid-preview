'use client';

import { MapPin, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import type { ViewRole } from '../types/chat.types';

export interface ChatPanelHeaderProps {
  existingRating: { id: string } | null;
  onOpenReview: () => void;
  otherPartyAddress: null | string;
  otherPartyName: string;
  viewRole: ViewRole;
}

export function ChatPanelHeader({
  existingRating,
  onOpenReview,
  otherPartyAddress,
  otherPartyName,
  viewRole,
}: ChatPanelHeaderProps) {
  const t = useTranslations('chat');

  return (
    <header className='flex items-center justify-between border-b px-4 py-3'>
      <div>
        <h2 className='font-semibold'>{otherPartyName}</h2>
        {otherPartyAddress && (
          <p className='flex items-center gap-1 text-sm text-muted-foreground'>
            <MapPin className='h-3.5 w-3.5' />
            {otherPartyAddress}
          </p>
        )}
      </div>
      <div className='flex items-center gap-2'>
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
