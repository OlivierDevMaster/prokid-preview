'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

import { createClient } from '@/lib/supabase/client';

import { conversationsQueryKey } from './useConversations';
import { messagesQueryKey } from './useMessages';

/**
 * Subscribes to realtime message events for a conversation.
 * Invalidates messages and conversations queries on INSERT/UPDATE/DELETE.
 */
export function useChatRealtime(conversationId: null | string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const channelRef = useRef<null | ReturnType<
    ReturnType<typeof createClient>['channel']
  >>(null);

  useEffect(() => {
    if (!conversationId || !session?.user?.id) {
      return;
    }

    const supabase = createClient();

    if (channelRef.current) {
      return;
    }

    const setupRealtime = async () => {
      const {
        data: { session: supabaseSession },
      } = await supabase.auth.getSession();

      if (!supabaseSession?.access_token) {
        return;
      }

      await supabase.realtime.setAuth(supabaseSession.access_token);

      const channel = supabase.channel(
        `conversation:${conversationId}:messages`,
        { config: { private: true } }
      );

      channelRef.current = channel;

      const invalidate = () => {
        queryClient.invalidateQueries({
          queryKey: messagesQueryKey(conversationId),
        });
        queryClient.invalidateQueries({ queryKey: conversationsQueryKey });
      };

      channel
        .on('broadcast', { event: 'INSERT' }, invalidate)
        .on('broadcast', { event: 'UPDATE' }, invalidate)
        .on('broadcast', { event: 'DELETE' }, invalidate)
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, session?.user?.id, queryClient]);
}
