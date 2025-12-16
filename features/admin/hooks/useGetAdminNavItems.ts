import { LayoutDashboard, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarNavItem } from '@/modeles/navigation.modele';

export default function useGetAdminNavItems(): SidebarNavItem[] {
  const tAdmin = useTranslations('admin');

  const items: SidebarNavItem[] = [
    {
      href: '/admin',
      icon: LayoutDashboard,
      label: tAdmin('navigation.dashboard'),
    },
    {
      href: '/admin/users',
      icon: Users,
      label: tAdmin('navigation.users'),
    },
    {
      href: '/admin/professionals',
      icon: Users,
      label: tAdmin('navigation.professionals'),
    },
    {
      href: '/admin/structures',
      icon: Users,
      label: tAdmin('navigation.structures'),
    },
  ];

  return items;
}
