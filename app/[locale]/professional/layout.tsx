'use client';

import { useQuery } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BoNavbar } from '@/features/layout/BoNavbar';
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
    const isOnboardingPage = pathname?.includes(
      '/auth/sign-up/professional/on-boarding'
    );
    if (
      status === 'authenticated' &&
      !isLoadingProfile &&
      userData &&
      userData.role === 'professional' &&
      !isOnboardingPage &&
      !userData.isOnboarded
    ) {
      router.push('/auth/sign-up/professional/on-boarding');
    }
  }, [status, userData, isLoadingProfile, router, pathname]);

  if (status === 'loading' || isLoadingProfile) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center'>
        <div>Loading...</div>
      </main>
    );
  }

  if (!session || !userData || userData.role !== 'professional') {
    return null;
  }

  // Allow access to subscription page
  if (subscriptionPath === 'professional/subscription') {
    return <div>{children}</div>;
  }

  // If not onboarded, the useEffect will redirect, but we should still show loading
  // to prevent flash of content
  if (!userData.isOnboarded) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center'>
        <div>Loading...</div>
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
    <div className='flex h-screen flex-col overflow-hidden'>
      <div className='relative flex flex-col items-start border-b shadow-sm lg:flex-row lg:border-b-0 lg:shadow-none'>
        <BoNavbar name={professionalName} userRole='Professional' />
        {/* Mobile Menu Button */}
        <div className='lg:hidden'>
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
      <div className='flex flex-1 overflow-hidden'>
        {/* Desktop Sidebar */}
        <div className='hidden h-full flex-shrink-0 lg:flex'>
          <ProfessionalSidebar />
        </div>

        {/* Mobile/Tablet Sheet */}
        <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
          <SheetContent className='w-64 p-0' side='left'>
            <ProfessionalSidebar />
          </SheetContent>
        </Sheet>

        <main className='flex-1 overflow-y-auto'>
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
