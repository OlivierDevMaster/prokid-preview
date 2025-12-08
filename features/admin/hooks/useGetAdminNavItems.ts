'use client';

import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export default function useGetAdminNavItems(): NavItem[] {
  const tAdmin = useTranslations('admin');

  const items: NavItem[] = [
    {
      href: '/admin/users',
      icon: 'users',
      label: tAdmin('navigation.users'),
    },
    {
      href: '/admin/professionals',
      icon: 'users',
      label: tAdmin('navigation.professionals'),
    },
    {
      href: '/admin/structures',
      icon: 'users',
      label: tAdmin('navigation.structures'),
    },
  ];

  return items;
}
