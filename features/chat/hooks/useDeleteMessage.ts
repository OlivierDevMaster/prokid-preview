'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMessage } from '../services/message.service';
import { conversationsQueryKey } from './useConversations';
import { messagesQueryKey } from './useMessages';

interface DeleteMessageVariables {
  messageId: string;
}

export function useDeleteMessage(conversationId: null | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId }: DeleteMessageVariables) =>
      deleteMessage(messageId),
    onSuccess: () => {
      if (!conversationId) return;
      queryClient.invalidateQueries({
        queryKey: messagesQueryKey(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
    },
  });
}
