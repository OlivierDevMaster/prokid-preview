import { Building2, LayoutDashboard, MessageSquare, Tag, UserPlus, Users } from 'lucide-react';
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
      href: '/admin/professionals',
      icon: Users,
      label: tAdmin('navigation.professionals'),
    },
    {
      href: '/admin/structures',
      icon: Building2,
      label: tAdmin('navigation.structures'),
    },
    {
      href: '/admin/missions',
      icon: MessageSquare,
      label: tAdmin('navigation.missions'),
    },
    {
      href: '/admin/tags',
      icon: Tag,
      label: tAdmin('navigation.tags'),
    },
    {
      href: '/admin/invite',
      icon: UserPlus,
      label: 'Inviter',
    },
    {
      href: '/admin/users',
      icon: Users,
      label: 'Utilisateurs',
    },
  ];

  return items;
}
