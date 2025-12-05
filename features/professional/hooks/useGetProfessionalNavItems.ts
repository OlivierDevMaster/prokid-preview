import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export default function useGetProfessionalNavItems(): NavItem[] {
  const tProfessional = useTranslations('admin');

  const items: NavItem[] = [
    {
      href: '/professional/plannings',
      icon: 'planning',
      label: tProfessional('navigation.planning'),
    },
    {
      href: '/professional/reports',
      icon: 'report',
      label: tProfessional('navigation.reports'),
    },
    {
      href: '/professional/structures',
      icon: 'structure',
      label: tProfessional('navigation.structure'),
    },
  ];

  return items;
}
