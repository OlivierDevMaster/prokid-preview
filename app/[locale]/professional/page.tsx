'use client';

import { useLocale } from 'next-intl';

import { redirect } from '@/i18n/routing';

export default function DashboardPage() {
  const locale = useLocale();
  redirect({ href: '/professional/dashboard', locale });
}
