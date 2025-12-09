'use client';

import { useEffect } from 'react';

import { useRouter } from '@/i18n/routing';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/professionals');
  }, [router]);

  return (
    <main className='flex min-h-screen flex-col items-center'>
      <div className='mt-4 text-2xl font-bold'>loading....</div>
    </main>
  );
}
