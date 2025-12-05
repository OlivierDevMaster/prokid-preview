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
  const isAdminRoute = pathname?.includes('/admin');
  const isAuthRoute = pathname?.includes('/auth');
  const isProfessionalRoute = pathname?.includes('/professional');
  const isStructureRoute = pathname?.includes('/structure');

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
