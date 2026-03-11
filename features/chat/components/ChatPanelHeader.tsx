'use client';

import { MapPin, MoreHorizontal, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { ViewRole } from '../types/chat.types';

export interface ChatPanelHeaderProps {
  membershipId: null | string | undefined;
  onOpenReview: () => void;
  otherPartyAddress: null | string;
  otherPartyName: string;
  viewRole: ViewRole;
}

export function ChatPanelHeader({
  membershipId,
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label={t('moreOptions')} size='icon' variant='ghost'>
                <MoreHorizontal className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem disabled={!membershipId} onClick={onOpenReview}>
                <Star className='mr-2 h-4 w-4' />
                {t('leaveReview')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
