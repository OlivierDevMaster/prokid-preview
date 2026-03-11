'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMessageContent } from '../services/message.service';
import { conversationsQueryKey } from './useConversations';
import { messagesQueryKey } from './useMessages';

interface UpdateMessageContentVariables {
  content: string;
  messageId: string;
}

export function useUpdateMessageContent(conversationId: null | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, messageId }: UpdateMessageContentVariables) =>
      updateMessageContent(messageId, content),
    onSuccess: () => {
      if (!conversationId) return;
      queryClient.invalidateQueries({
        queryKey: messagesQueryKey(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
    },
  });
}
