import { FileText, LayoutDashboard, Mail, Search, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarNavItem } from '@/modeles/navigation.modele';

export function useGetStructureSidebarItems(): SidebarNavItem[] {
  const tStructure = useTranslations('structure.navigation');
  const tAdmin = useTranslations('admin');
  const items: SidebarNavItem[] = [
    {
      href: '/structure/dashboard',
      icon: LayoutDashboard,
      label: tStructure('dashboard'),
    },
    {
      href: '/structure/search',
      icon: Search,
      label: tStructure('search'),
    },
    {
      href: '/structure/invitations',
      icon: Mail,
      label: tStructure('messaging'),
    },
    {
      href: '/structure/reports',
      icon: FileText,
      label: tStructure('reports'),
    },

    {
      href: '/structure/settings',
      icon: User,
      label: tAdmin('navigation.profile'),
    },
  ];
  return items;
}
