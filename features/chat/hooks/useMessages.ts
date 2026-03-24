'use client';

import { useQuery } from '@tanstack/react-query';

import type { GetMessagesOptions } from '../types/chat.types';

import { getMessages } from '../services/message.service';

export function messagesQueryKey(conversationId: null | string) {
  return ['messages', conversationId] as const;
}

export function useMessages(
  conversationId: null | string,
  options: GetMessagesOptions = {}
) {
  return useQuery({
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) return [];
      return getMessages(conversationId, options);
    },
    queryKey: [...messagesQueryKey(conversationId), options],
  });
}
