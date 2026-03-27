'use client';

import { differenceInDays, isToday, isYesterday } from 'date-fns';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type { ConversationWithDetails } from '../types/chat.types';

import { MissionStatusBadge } from './MissionStatusBadge';

export interface ConversationListItemProps {
  conversation: ConversationWithDetails;
  currentUserId?: string;
  isSelected: boolean;
  onSelect: () => void;
  viewRole: ViewRole;
}

type ViewRole = 'professional' | 'structure';

export function ConversationListItem({
  conversation: conv,
  currentUserId,
  isSelected,
  onSelect,
  viewRole,
}: ConversationListItemProps) {
  const t = useTranslations('chat');
  const name = getOtherPartyName(conv, viewRole);
  const isStructure = viewRole === 'professional';

  // Determine conversation status
  const lastSenderId = conv.last_message_sender_id;
  const waitingForMyReply = lastSenderId && currentUserId && lastSenderId !== currentUserId;
  const iSentLast = lastSenderId && currentUserId && lastSenderId === currentUserId;

  return (
    <li>
      <button
        className={`flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-muted/50 ${
          isSelected
            ? 'border-l-4 border-l-primary bg-muted/50'
            : 'border-l-4 border-l-transparent'
        }`}
        onClick={onSelect}
        type='button'
      >
        <div className='flex-shrink-0'>
          {isStructure ? (
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
              <Building2 className='h-5 w-5 text-muted-foreground' />
            </div>
          ) : (
            <div className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted'>
              {conv.professional?.profile?.avatar_url ? (
                <Image
                  alt={name}
                  className='h-full w-full object-cover'
                  height={40}
                  src={conv.professional.profile.avatar_url}
                  unoptimized
                  width={40}
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center rounded-full text-sm font-medium ${
                    AVATAR_COLOR_VARIANTS[
                      getAvatarColorVariantIndex(conv.professional_id)
                    ].bg
                  } ${
                    AVATAR_COLOR_VARIANTS[
                      getAvatarColorVariantIndex(conv.professional_id)
                    ].text
                  }`}
                >
                  {name
                    .split(' ')
                    .map(s => s[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || '?'}
                </div>
              )}
            </div>
          )}
        </div>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex items-center justify-between gap-1'>
            <span className='truncate text-sm font-medium'>{name}</span>
            <span className='flex-shrink-0 text-xs text-muted-foreground'>
              {formatLastMessageAt(conv.last_message_at, k => t(k))}
            </span>
          </div>
          <p className='truncate text-xs text-muted-foreground'>
            {getConversationPreview(conv, k => t(k))}
          </p>
          {waitingForMyReply ? (
            <span className='mt-1 inline-flex self-start rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700'>
              En attente de votre réponse
            </span>
          ) : conv.mission?.status ? (
            <span className='mt-1 self-start'>
              <MissionStatusBadge compact status={conv.mission.status} />
            </span>
          ) : null}
        </div>
      </button>
    </li>
  );
}

function formatLastMessageAt(
  lastMessageAt: null | string,
  t: (k: string) => string
): string {
  if (!lastMessageAt) return '';
  const d = new Date(lastMessageAt);
  if (isToday(d)) return t('today');
  if (isYesterday(d)) return t('yesterday');
  const days = differenceInDays(new Date(), d);
  if (days <= 30) return `${days} j`;
  return '+30 j';
}

function getConversationPreview(
  conv: ConversationWithDetails,
  t: (k: string) => string
): string {
  const preview = conv.last_message_preview?.trim();
  if (preview === 'accepted') return t('systemPreviewAccepted');
  if (preview === 'declined') return t('systemPreviewDeclined');
  if (preview === 'cancelled') return t('systemPreviewCancelled');
  if (conv.mission?.status === 'accepted') {
    return preview || (conv.mission?.title ?? '');
  }
  return conv.mission?.title ?? '';
}

function getOtherPartyName(
  conv: ConversationWithDetails,
  viewRole: ViewRole
): string {
  if (viewRole === 'structure') {
    const p = conv.professional?.profile;
    if (p?.first_name || p?.last_name) {
      return [p.first_name, p.last_name].filter(Boolean).join(' ') ?? '';
    }
    return conv.professional?.profile?.email ?? 'Professionnel';
  }
  return conv.structure?.name ?? 'Structure';
}
