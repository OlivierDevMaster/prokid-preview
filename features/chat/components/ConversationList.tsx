'use client';

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Building2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type {
  ConversationWithDetails,
  MissionStatus,
} from '../types/chat.types';

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
              const mission = conv.mission;

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
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
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
                        {conv.mission?.status === 'accepted'
                          ? conv.last_message_preview || conv.mission?.title
                          : conv.mission?.title}
                      </p>
                      {conv.mission?.status ? (
                        <Badge
                          className='mt-1 self-start text-xs'
                          variant='secondary'
                        >
                          {getMissionStatusLabel(
                            conv.mission?.status as MissionStatus,
                            k => t(k)
                          )}
                        </Badge>
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

function getMissionStatusLabel(
  status: MissionStatus,
  t: (k: string) => string
): string {
  const key: Record<MissionStatus, string> = {
    accepted: 'statusAccepted',
    cancelled: 'statusCancelled',
    declined: 'statusDeclined',
    ended: 'statusEnded',
    expired: 'statusExpired',
    pending: 'statusPending',
  };
  return t(key[status] ?? 'statusPending');
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
