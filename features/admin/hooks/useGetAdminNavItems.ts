import { Building2, CalendarCheck, LayoutDashboard, Tag, UserPlus, Users, UsersRound } from 'lucide-react';

import { SidebarNavItem } from '@/modeles/navigation.modele';

export default function useGetAdminNavItems(): SidebarNavItem[] {
  const items: SidebarNavItem[] = [
    {
      href: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    // --- Utilisateurs ---
    {
      href: '/admin/users',
      icon: UsersRound,
      label: 'Utilisateurs',
    },
    {
      href: '/admin/professionals',
      icon: Users,
      label: 'Professionnels',
    },
    {
      href: '/admin/structures',
      icon: Building2,
      label: 'Structures',
    },
    // --- Activité ---
    {
      href: '/admin/missions',
      icon: CalendarCheck,
      label: 'Missions',
    },
    // --- Outils ---
    {
      href: '/admin/tags',
      icon: Tag,
      label: 'Tags',
    },
    {
      href: '/admin/invite',
      icon: UserPlus,
      label: 'Inviter',
    },
  ];

  return items;
}
