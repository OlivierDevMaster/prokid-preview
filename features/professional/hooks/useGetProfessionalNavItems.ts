import {
  Building2,
  Calendar,
  ClipboardMinus,
  LayoutDashboard,
  Target,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarNavItem } from '@/modeles/navigation.modele';

export default function useGetProfessionalNavItems(): SidebarNavItem[] {
  const tProfessional = useTranslations('admin');

  const items: SidebarNavItem[] = [
    {
      href: '/professional/dashboard',
      icon: LayoutDashboard,
      label: tProfessional('navigation.dashboard'),
    },
    {
      href: '/professional/availabilities',
      icon: Calendar,
      label: tProfessional('navigation.availabilities'),
    },
    {
      href: '/professional/missions',
      icon: Target,
      label: tProfessional('navigation.missions'),
    },
    {
      href: '/professional/reports',
      icon: ClipboardMinus,
      label: tProfessional('navigation.reports'),
    },
    {
      href: '/professional/structures',
      icon: Building2,
      label: tProfessional('navigation.structure'),
    },
  ];

  return items;
}
