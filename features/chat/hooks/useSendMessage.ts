'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { SendMessageParams } from '../types/chat.types';

import { sendMessage } from '../services/message.service';
import { conversationsQueryKey } from './useConversations';
import { messagesQueryKey } from './useMessages';

export function useSendMessage(conversationId: null | string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      if (!conversationId || !userId) {
        throw new Error('Conversation and user are required to send a message');
      }
      return sendMessage(conversationId, userId, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: messagesQueryKey(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
    },
  });
}
