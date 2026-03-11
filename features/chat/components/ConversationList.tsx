'use client';

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Building2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type { ConversationWithDetails } from '../types/chat.types';

import { MissionStatusBadge } from './MissionStatusBadge';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  isLoading?: boolean;
  onSelectConversation: (id: string) => void;
  selectedConversationId: null | string;
  viewRole: ViewRole;
}

type ViewRole = 'professional' | 'structure';

export function ConversationList({
  conversations,
  isLoading = false,
  onSelectConversation,
  selectedConversationId,
  viewRole,
}: ConversationListProps) {
  const t = useTranslations('chat');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.trim().toLowerCase();
    return conversations.filter(c => {
      const name = getOtherPartyName(c, viewRole).toLowerCase();
      const missionTitle = c.mission?.title?.toLowerCase() ?? '';
      return name.includes(q) || missionTitle.includes(q);
    });
  }, [conversations, search, viewRole]);

  return (
    <div className='flex h-full flex-col border-r bg-muted/30'>
      <div className='p-3'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            className='h-10 rounded-full border-none bg-[#f1f5f9] pl-9 outline-none focus-visible:ring-0'
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            value={search}
          />
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='p-4 text-center text-sm text-muted-foreground'>
            {t('loadingConversations')}
          </div>
        ) : filtered.length === 0 ? (
          <div className='p-4 text-center text-sm text-muted-foreground'>
            {t('noConversations')}
          </div>
        ) : (
          <ul className='space-y-0'>
            {filtered.map(conv => {
              const isSelected = conv.id === selectedConversationId;
              const name = getOtherPartyName(conv, viewRole);
              const isStructure = viewRole === 'professional';

              return (
                <li key={conv.id}>
                  <button
                    className={`flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-muted/50 ${
                      isSelected
                        ? 'border-l-4 border-l-primary bg-muted/50'
                        : ''
                    }`}
                    onClick={() => onSelectConversation(conv.id)}
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
                                  getAvatarColorVariantIndex(
                                    conv.professional_id
                                  )
                                ].bg
                              } ${
                                AVATAR_COLOR_VARIANTS[
                                  getAvatarColorVariantIndex(
                                    conv.professional_id
                                  )
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
                        <span className='truncate text-sm font-medium'>
                          {name}
                        </span>
                        <span className='flex-shrink-0 text-xs text-muted-foreground'>
                          {formatLastMessageAt(conv.last_message_at, k => t(k))}
                        </span>
                      </div>
                      <p className='truncate text-xs text-muted-foreground'>
                        {getConversationPreview(conv, k => t(k))}
                      </p>
                      {conv.mission?.status ? (
                        <span className='mt-1 self-start'>
                          <MissionStatusBadge
                            compact
                            status={conv.mission.status}
                          />
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
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
  if (d.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
    return format(d, 'EEE'); // Mon, Tue...
  }
  return formatDistanceToNow(d, { addSuffix: false });
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
