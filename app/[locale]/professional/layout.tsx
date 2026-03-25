'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ProfessionalSidebar } from '@/features/professional/layout/ProfessionalSidebar';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { usePathname } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { getUser } from '@/services/auth/auth.service';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const subscriptionPath = pathname?.split('/').slice(-2).join('/') || '';
  const isChatRoute = pathname?.includes('/professional/chat') ?? false;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const hasRedirectedToOnboarding = useRef(false);

  // Disable body scroll on this route
  useBodyScrollLock();

  // Close sheet when pathname changes (navigation)
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  // Fetch user profile to check role
  const { data: userData, isLoading: isLoadingProfile } = useQuery({
    enabled: !!session?.user?.id && status === 'authenticated',
    queryFn: async () => {
      if (!session?.user?.id) {
        return null;
      }
      const result = await getUser(session.user.id);
      if (result.error) {
        return null;
      }
      return result.profile;
    },
    queryKey: ['user-profile', session?.user?.id],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Check if profile is loaded and role is not professional
    if (
      status === 'authenticated' &&
      !isLoadingProfile &&
      userData &&
      userData.role !== 'professional'
    ) {
      router.push('/auth/login');
      return;
    }

    // Check if professional is onboarded (but allow access to onboarding page)
    const isOnboardingPage = pathname?.includes('/professional/on-boarding');

    const shouldRedirectToOnboarding =
      status === 'authenticated' &&
      !isLoadingProfile &&
      userData &&
      userData.role === 'professional' &&
      !isOnboardingPage &&
      !userData.isOnboarded;

    if (shouldRedirectToOnboarding && !hasRedirectedToOnboarding.current) {
      hasRedirectedToOnboarding.current = true;
      router.replace('/professional/on-boarding');
    }
  }, [status, userData, isLoadingProfile, pathname, router]);

  if (status === 'loading' || isLoadingProfile) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
      </main>
    );
  }

  if (!session || !userData || userData.role !== 'professional') {
    return null;
  }

  // Allow access to subscription page
  if (subscriptionPath === 'professional/subscription') {
    return (
      <div className='flex h-screen flex-col overflow-hidden'>
        <main className='flex-1 overflow-y-auto'>{children}</main>
      </div>
    );
  }

  // Full-width onboarding (no sidebar, no logo) — fixed height so form column can scroll
  const isOnboardingPath = pathname?.includes('/professional/on-boarding');
  if (isOnboardingPath) {
    return <main className='h-screen w-full overflow-hidden'>{children}</main>;
  }

  // If not onboarded, the useEffect will redirect, but we should still show loading
  // to prevent flash of content
  if (!userData.isOnboarded) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
      </main>
    );
  }

  // Get professional name from profile
  const professionalName =
    userData.fullName ||
    (userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData.firstName || userData.email || 'Professionnel');

  return (
    <div className='flex h-screen overflow-hidden'>
      {/* Desktop Sidebar */}
      <div className='hidden h-full flex-shrink-0 lg:flex'>
        <ProfessionalSidebar />
      </div>

      {/* Mobile/Tablet Sheet */}
      <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
        <SheetContent
          className='flex w-full max-w-full flex-col p-0 sm:max-w-sm'
          side='left'
        >
          <ProfessionalSidebar expanded />
        </SheetContent>
      </Sheet>

      <main
        className={
          isChatRoute
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
            : 'flex-1 overflow-y-auto'
        }
      >
        {/* Mobile menu button */}
        <div className='border-b bg-white px-4 py-2 shadow-sm lg:hidden'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-medium text-gray-900'>
              {professionalName}
            </div>
            <Button
              className='h-9 w-9'
              onClick={() => setIsSheetOpen(true)}
              size='icon'
              variant='ghost'
            >
              <Menu className='h-5 w-5' />
            </Button>
          </div>
        </div>
        <div
          className={isChatRoute ? 'min-h-0 w-full flex-1' : 'h-full w-full'}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
