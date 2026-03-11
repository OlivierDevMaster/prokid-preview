'use client';

import { useQuery } from '@tanstack/react-query';

import { getConversations } from '../services/conversation.service';

export const conversationsQueryKey = ['conversations'] as const;

export function useConversations() {
  return useQuery({
    queryFn: getConversations,
    queryKey: conversationsQueryKey,
  });
}
