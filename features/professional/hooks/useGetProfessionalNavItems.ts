import { ClipboardMinus, LayoutDashboard, Mail, User } from 'lucide-react';
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
      href: '/professional/reports',
      icon: ClipboardMinus,
      label: tProfessional('navigation.reports'),
    },
    {
      badgeCount: 1,
      href: '/professional/invitations',
      icon: Mail,
      label: tProfessional('navigation.messaging'),
    },
    {
      href: '/professional/setting',
      icon: User,
      label: tProfessional('navigation.profile'),
    },
  ];

  return items;
}
