'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { AdminNavbar } from '@/features/admin/layout/AdminNavbar';
import { AdminSidebar } from '@/features/admin/layout/Sidebar';
import { useRouter } from '@/i18n/routing';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center'>
        <div>Loading...</div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <AdminSidebar />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <AdminNavbar />
        <main className='flex-1 overflow-auto'>
          <div className='p-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
