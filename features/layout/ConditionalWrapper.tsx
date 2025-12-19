'use client';

import { Footer } from '@/features/layout/Footer';
import { Navigation } from '@/features/layout/Navigation';
import { usePathname } from '@/i18n/routing';

export default function ConditionalWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // usePathname() from next-intl should return pathname without locale
  // But if the locale is in the URL (for non-default locales like 'fr'),
  // we need to skip it
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const firstSegment = pathSegments[0];

  // If the first segment is 'fr' (a locale in the URL), use the second segment
  // For 'en' (defaultLocale), the locale is not in the URL, so use the first segment
  const parsedPathname = firstSegment === 'en' ? pathSegments[1] : firstSegment;

  const isAdminRoute = parsedPathname === 'admin';
  const isAuthRoute = parsedPathname === 'auth';
  const isProfessionalRoute = parsedPathname === 'professional';
  const isStructureRoute = parsedPathname === 'structure';

  if (isProfessionalRoute || isStructureRoute || isAdminRoute || isAuthRoute) {
    return (
      <div className='flex min-h-screen flex-col'>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <Navigation />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  );
}
