'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { getUser } from '@/services/auth/auth.service';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export default function useGetAdminNavItems(): NavItem[] {
  const { data: session } = useSession();
  const user = session?.user;
  const tAdmin = useTranslations('admin');
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  const { data } = useQuery({
    enabled: !!user?.id,
    queryFn: () => getUser(user?.id as string),
    queryKey: ['user', user?.id],
  });

  useEffect(() => {
    const profile = data?.profile;
    const items: NavItem[] = [];

    if (profile?.role === 'professional') {
      items.push({
        href: '/admin/planning',
        icon: 'planning',
        label: tAdmin('navigation.planning'),
      });
      items.push({
        href: '/admin/report',
        icon: 'report',
        label: tAdmin('navigation.reports'),
      });
      items.push({
        href: '/admin/structure',
        icon: 'structure',
        label: tAdmin('navigation.structure'),
      });
    }

    if (profile?.role === 'admin') {
      items.push({
        href: '/admin/users',
        icon: 'users',
        label: tAdmin('navigation.users'),
      });
    }

    setNavItems(items);
  }, [user, data?.profile, tAdmin]);

  // Toujours retourner un tableau vide au premier render pour éviter les problèmes d'hydratation
  // Les items seront mis à jour dans useEffect après l'hydratation
  return navItems;
}
