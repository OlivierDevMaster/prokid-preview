'use client';

import { useQuery } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AdminSidebar } from '@/features/admin/layout/AdminSidebar';
import { BoNavbar } from '@/features/layout/BoNavbar';
import { usePathname } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { getUser } from '@/services/auth/auth.service';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

    // Check if profile is loaded and role is not admin
    if (
      status === 'authenticated' &&
      !isLoadingProfile &&
      userData &&
      userData.role !== 'admin'
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

  if (!session || !userData || userData.role !== 'admin') {
    return null;
  }

  // Get admin name from profile
  const adminName =
    userData.fullName ||
    (userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData.firstName || userData.email || 'Admin');

  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <div className='relative border-b shadow-sm lg:border-b-0 lg:shadow-none'>
        <div className='pl-12 lg:pl-0'>
          <BoNavbar name={adminName} userRole='Admin' />
        </div>
        {/* Mobile Menu Button */}
        <Button
          className='absolute left-2 top-1/2 z-[60] h-9 w-9 -translate-y-1/2 lg:hidden'
          onClick={() => setIsSheetOpen(true)}
          size='icon'
          variant='ghost'
        >
          <Menu className='h-5 w-5' />
        </Button>
      </div>
      <div className='flex flex-1 overflow-hidden'>
        {/* Desktop Sidebar */}
        <div className='hidden h-full flex-shrink-0 lg:flex'>
          <AdminSidebar />
        </div>

        {/* Mobile/Tablet Sheet */}
        <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
          <SheetContent className='w-64 p-0' side='left'>
            <AdminSidebar />
          </SheetContent>
        </Sheet>

        <main className='flex-1 overflow-y-auto'>
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
