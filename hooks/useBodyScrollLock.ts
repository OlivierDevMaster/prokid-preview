'use client';

import { useEffect } from 'react';

/**
 * Hook to disable body scroll when component mounts
 * and restore it when component unmounts
 */
export function useBodyScrollLock() {
  useEffect(() => {
    // Store the original overflow value
    const originalOverflow = document.body.style.overflow;

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Cleanup: restore original overflow value on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);
}
