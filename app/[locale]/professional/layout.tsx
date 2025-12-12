'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { BoNavbar } from '@/features/layout/BoNavbar';
import { ProfessionalSidebar } from '@/features/professional/layout/ProfessionalSidebar';
import { useRouter } from '@/i18n/routing';
import { getUser } from '@/services/auth/auth.service';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    }
  }, [status, userData, isLoadingProfile, router]);

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

  return (
    <div className='flex min-h-screen flex-col'>
      <BoNavbar userRole='professionnel' />
      <div className='bg-green flex flex-1 overflow-hidden'>
        <ProfessionalSidebar />
        <main className='flex-1 overflow-auto'>
          <div className='p-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
