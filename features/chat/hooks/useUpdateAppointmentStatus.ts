'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMessageStatus } from '../services/message.service';
import { conversationsQueryKey } from './useConversations';
import { messagesQueryKey } from './useMessages';

export function useUpdateAppointmentStatus(conversationId: null | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      status,
    }: {
      messageId: string;
      status: 'cancelled' | 'confirmed' | 'rejected';
    }) => updateMessageStatus(messageId, status),
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
