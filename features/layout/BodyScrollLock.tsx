'use client';

import { useEffect } from 'react';

import { usePathname } from '@/i18n/routing';

export function BodyScrollLock() {
  const pathname = usePathname();

  useEffect(() => {
    // usePathname() from next-intl should return pathname without locale
    // But if the locale is in the URL (for non-default locales like 'fr'),
    // we need to skip it
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const firstSegment = pathSegments[0];

    // If the first segment is 'fr' (a locale in the URL), use the second segment
    // For 'en' (defaultLocale), the locale is not in the URL, so use the first segment
    const parsedPathname =
      firstSegment === 'en' ? pathSegments[1] : firstSegment;

    // Check if current route is structure, professional, or admin
    const shouldLockBody =
      parsedPathname === 'structure' ||
      parsedPathname === 'professional' ||
      parsedPathname === 'admin';

    // Add or remove overflow-hidden from body
    if (shouldLockBody) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup: restore overflow when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [pathname]);

  return null;
}
