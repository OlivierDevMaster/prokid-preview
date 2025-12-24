'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { BoNavbar } from '@/features/layout/BoNavbar';
import { ProfessionalSidebar } from '@/features/professional/layout/ProfessionalSidebar';
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

  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <BoNavbar userRole='professionnel' />
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex h-full flex-shrink-0'>
          <ProfessionalSidebar />
        </div>
        <main className='flex-1 overflow-y-auto'>
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
