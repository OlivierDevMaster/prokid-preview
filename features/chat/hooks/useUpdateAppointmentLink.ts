'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMessageContent } from '../services/message.service';
import { conversationsQueryKey } from './useConversations';
import { messagesQueryKey } from './useMessages';

export function useUpdateAppointmentLink(conversationId: null | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      messageId,
    }: {
      content: string;
      messageId: string;
    }) => updateMessageContent(messageId, content),
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: messagesQueryKey(conversationId),
        });
      }
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
    },
  });
}
