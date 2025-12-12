import { Calendar, ClipboardMinus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarNavItem } from '@/modeles/navigation.modele';

export default function useGetProfessionalNavItems(): SidebarNavItem[] {
  const tProfessional = useTranslations('admin');

  const items: SidebarNavItem[] = [
    {
      href: '/professional/availabilities',
      icon: Calendar,
      label: tProfessional('navigation.availabilities'),
    },
    {
      href: '/professional/reports',
      icon: ClipboardMinus,
      label: tProfessional('navigation.reports'),
    },
    {
      href: '/professional/structures',
      icon: Users,
      label: tProfessional('navigation.structure'),
    },
  ];

  return items;
}
