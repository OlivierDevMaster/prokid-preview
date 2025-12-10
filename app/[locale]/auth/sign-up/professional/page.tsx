'use client';

import { useEffect } from 'react';

import { useRouter } from '@/i18n/routing';

export default function ProfessionalSignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/sign-up/professional/account');
  }, [router]);

  return null;
}
