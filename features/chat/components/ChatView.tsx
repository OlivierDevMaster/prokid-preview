'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ViewRole } from '../types/chat.types';

import { useChatRealtime } from '../hooks/useChatRealtime';
import { useConversation } from '../hooks/useConversation';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { ChatPanel } from './ChatPanel';
import { ConversationList } from './ConversationList';
import { ParticipantPanel } from './ParticipantPanel';

interface ChatViewProps {
  viewRole: ViewRole;
}

export function ChatView({ viewRole }: ChatViewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialConversationId = searchParams.get('conversationId');

  const [selectedConversationId, setSelectedConversationId] = useState<
    null | string
  >(initialConversationId);

  const lastSelectedIdRef = useRef<null | string>(null);

  const { data: conversations = [], isLoading: isLoadingConversations } =
    useConversations();
  const { data: selectedConversation } = useConversation(
    selectedConversationId
  );
  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(
    selectedConversationId
  );

  useChatRealtime(selectedConversationId);

  useEffect(() => {
    const urlConversationId = searchParams.get('conversationId');
    const hasConversations = conversations.length > 0;

    if (
      lastSelectedIdRef.current !== null &&
      selectedConversationId === lastSelectedIdRef.current
    ) {
      if (urlConversationId === lastSelectedIdRef.current) {
        lastSelectedIdRef.current = null;
      }
      return;
    }

    if (urlConversationId && urlConversationId !== selectedConversationId) {
      setSelectedConversationId(urlConversationId);
      return;
    }

    if (!urlConversationId && !selectedConversationId && hasConversations) {
      const firstConversationId = conversations[0]?.id ?? null;
      if (!firstConversationId) return;

      setSelectedConversationId(firstConversationId);

      const params = new URLSearchParams(searchParams.toString());
      params.set('conversationId', firstConversationId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [conversations, pathname, router, searchParams, selectedConversationId]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      lastSelectedIdRef.current = id;
      setSelectedConversationId(id);

      const params = new URLSearchParams(searchParams.toString());
      params.set('conversationId', id);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className='flex h-full w-full flex-1'>
      <div className='w-80 flex-shrink-0'>
        <ConversationList
          conversations={conversations}
          isLoading={isLoadingConversations}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversationId}
          viewRole={viewRole}
        />
      </div>
      <div className='flex min-w-0 flex-1'>
        <ChatPanel
          conversation={selectedConversation ?? null}
          currentUserId={session?.user?.id}
          isLoadingMessages={isLoadingMessages}
          messages={messages}
          viewRole={viewRole}
        />
        <ParticipantPanel
          conversation={selectedConversation ?? null}
          viewRole={viewRole}
        />
      </div>
    </div>
  );
}
