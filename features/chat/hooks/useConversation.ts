'use client';

import { useQuery } from '@tanstack/react-query';

import { getConversation } from '../services/conversation.service';

export function conversationQueryKey(conversationId: null | string) {
  return ['conversation', conversationId] as const;
}

export function useConversation(conversationId: null | string) {
  return useQuery({
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) return null;
      return getConversation(conversationId);
    },
    queryKey: conversationQueryKey(conversationId),
  });
}
