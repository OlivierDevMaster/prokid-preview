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
    enabled: !!user?.id, // Ne faire la requête que si l'ID existe
    queryFn: () => getUser(user?.id as string),
    queryKey: ['user', user?.id],
  });

  /**
   * Uncomment the code below when the user type is implemented
   */
  useEffect(() => {
    // if (!user || !data?.profile) {
    //   setNavItems([]);
    //   return;
    // }

    /**
     * Should be the user type or user role
     */
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

    /**
     * This should be like so :
     *  - if (profile.role === 'admin')
     */
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
