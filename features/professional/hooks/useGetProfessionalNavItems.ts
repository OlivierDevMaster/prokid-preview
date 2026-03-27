import {
  ClipboardMinus,
  LayoutDashboard,
  MessageCircle,
  Target,
  User,
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
      href: '/professional/chat',
      icon: MessageCircle,
      label: tProfessional('navigation.messaging'),
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
      href: '/professional/settings',
      icon: User,
      label: tProfessional('navigation.profile'),
    },
  ];

  return items;
}
