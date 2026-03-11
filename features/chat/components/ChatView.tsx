'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

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
  const [selectedConversationId, setSelectedConversationId] = useState<
    null | string
  >(null);

  const { data: conversations = [], isLoading: isLoadingConversations } =
    useConversations();
  const { data: selectedConversation } = useConversation(
    selectedConversationId
  );
  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(
    selectedConversationId
  );

  useChatRealtime(selectedConversationId);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  return (
    <div className='flex-1 flex h-full w-full'>
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
