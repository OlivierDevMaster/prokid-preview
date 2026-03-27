'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';

import type { ConversationWithDetails } from '../types/chat.types';

import { ConversationListItem } from './ConversationListItem';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  currentUserId?: string;
  isLoading?: boolean;
  onSelectConversation: (id: string) => void;
  selectedConversationId: null | string;
  viewRole: ViewRole;
}

type ViewRole = 'professional' | 'structure';

export function ConversationList({
  conversations,
  currentUserId,
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
      const name = getFilterName(c, viewRole).toLowerCase();
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
            {filtered.map(conv => (
              <ConversationListItem
                conversation={conv}
                currentUserId={currentUserId}
                isSelected={conv.id === selectedConversationId}
                key={conv.id}
                onSelect={() => onSelectConversation(conv.id)}
                viewRole={viewRole}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function getFilterName(
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
