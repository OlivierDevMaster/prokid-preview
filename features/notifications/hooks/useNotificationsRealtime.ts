'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

import { createClient } from '@/lib/supabase/client';

/**
 * Hook to subscribe to realtime notifications for the current user
 * Automatically invalidates the notifications query cache when changes occur
 *
 * @returns void - This hook only manages side effects (subscription and cache invalidation)
 */
export function useNotificationsRealtime() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const channelRef = useRef<null | ReturnType<
    ReturnType<typeof createClient>['channel']
  >>(null);

  useEffect(() => {
    // Don't subscribe if user is not authenticated
    if (!userId) {
      return;
    }

    const supabase = createClient();

    // Check if already subscribed to prevent multiple subscriptions
    if (channelRef.current) {
      return;
    }

    // Get Supabase session and set auth token for realtime
    const setupRealtime = async () => {
      const {
        data: { session: supabaseSession },
      } = await supabase.auth.getSession();

      if (!supabaseSession?.access_token) {
        console.error(
          'No Supabase session found. Cannot subscribe to realtime.'
        );
        return;
      }

      // Set auth token for realtime
      await supabase.realtime.setAuth(supabaseSession.access_token);

      // Create channel for user-specific notifications
      // Topic format: user:{userId}:notifications
      const channel = supabase.channel(`user:${userId}:notifications`, {
        config: { private: true },
      });

      channelRef.current = channel;

      // Subscribe to broadcast events
      channel
        .on('broadcast', { event: 'INSERT' }, () => {
          // Invalidate notifications queries when a new notification is inserted
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({
            queryKey: ['notification-unread-count'],
          });
        })
        .on('broadcast', { event: 'UPDATE' }, () => {
          // Invalidate notifications queries when a notification is updated (e.g., marked as read)
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({
            queryKey: ['notification-unread-count'],
          });
        })
        .on('broadcast', { event: 'DELETE' }, () => {
          // Invalidate notifications queries when a notification is deleted
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({
            queryKey: ['notification-unread-count'],
          });
        })
        .subscribe((status, err) => {
          console.log('Status:', status);
          console.log('Error:', err);
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to notifications realtime channel');
          } else if (status === 'CHANNEL_ERROR') {
            console.error(
              'Error subscribing to notifications realtime channel'
            );
          }
        });
    };

    setupRealtime();

    // Cleanup: unsubscribe when component unmounts or userId changes
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, queryClient]);
}
