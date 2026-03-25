'use client';

import { useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';

export function useTrackProfileView(
  professionalUserId: string | null | undefined
) {
  useEffect(() => {
    if (!professionalUserId) return;

    const trackView = async () => {
      try {
        const supabase = createClient();

        // Get current user (might be null for anonymous viewers)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Don't track if viewing own profile
        if (user?.id === professionalUserId) return;

        const { error: insertError } = await supabase.from('profile_views').insert({
          professional_id: professionalUserId,
          viewer_id: user?.id || null,
        });
        if (insertError) {
          console.error('[ProfileView] Insert failed:', insertError.message, insertError.code);
        } else {
          console.log('[ProfileView] Tracked view for', professionalUserId);
        }
      } catch (err) {
        console.error('[ProfileView] Error:', err);
      }
    };

    trackView();
  }, [professionalUserId]);
}
