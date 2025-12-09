'use client';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  router.push('/professional/dashboard');
  return null;
}
