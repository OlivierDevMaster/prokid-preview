'use client';

import { ArrowLeft } from 'lucide-react';
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
  // Prevent the "auto-select first conversation" effect from kicking in
  // right after the user intentionally goes back to the conversation list.
  const didUserGoBackToListRef = useRef(false);

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

    // If the user intentionally went back to the list, we may briefly still see the
    // previous `conversationId` in `searchParams` (URL update lag). Avoid re-selecting.
    if (didUserGoBackToListRef.current && !selectedConversationId) {
      return;
    }

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
      if (didUserGoBackToListRef.current) return;
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
      didUserGoBackToListRef.current = false;
      setSelectedConversationId(id);

      const params = new URLSearchParams(searchParams.toString());
      params.set('conversationId', id);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleBackToList = useCallback(() => {
    didUserGoBackToListRef.current = true;
    setSelectedConversationId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('conversationId');
    const nextParams = params.toString();
    router.replace(nextParams ? `${pathname}?${nextParams}` : pathname);
  }, [pathname, router, searchParams]);

  return (
    <div className='flex h-full min-h-0 w-full flex-1'>
      {/* Conversation list: always visible on lg+, hidden on mobile when a conversation is selected */}
      <div
        className={`w-full flex-shrink-0 lg:w-80 ${
          selectedConversationId ? 'hidden lg:block' : 'block'
        }`}
      >
        <ConversationList
          conversations={conversations}
          currentUserId={session?.user?.id}
          isLoading={isLoadingConversations}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversationId}
          viewRole={viewRole}
        />
      </div>
      {/* Chat panel: always visible on lg+, hidden on mobile when no conversation is selected */}
      <div
        className={`min-h-0 min-w-0 flex-1 ${
          selectedConversationId ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
          {/* Back button: only visible on mobile when a conversation is selected */}
          <button
            className='flex items-center gap-2 border-b px-3 py-2 text-sm text-muted-foreground hover:text-foreground lg:hidden'
            onClick={handleBackToList}
            type='button'
          >
            <ArrowLeft className='h-4 w-4' />
            Retour aux conversations
          </button>
          <ChatPanel
            conversation={selectedConversation ?? null}
            currentUserId={session?.user?.id}
            isLoadingMessages={isLoadingMessages}
            messages={messages}
            viewRole={viewRole}
          />
        </div>
        <ParticipantPanel
          conversation={selectedConversation ?? null}
          viewRole={viewRole}
        />
      </div>
    </div>
  );
}
