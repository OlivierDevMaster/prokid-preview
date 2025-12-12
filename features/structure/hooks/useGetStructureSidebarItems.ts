import { Target, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarNavItem } from '@/modeles/navigation.modele';

export function useGetStructureSidebarItems(): SidebarNavItem[] {
  const tStructure = useTranslations('structure.navigation');
  const items: SidebarNavItem[] = [
    {
      href: '/structure/missions',
      icon: Target,
      label: tStructure('missions'),
    },
    {
      href: '/structure/professionals',
      icon: Users,
      label: tStructure('professionals'),
    },
  ];
  return items;
}
