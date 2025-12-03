'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
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
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  const { data } = useQuery({
    enabled: !!user?.id, // Ne faire la requête que si l'ID existe
    queryFn: () => getUser(user?.id as string),
    queryKey: ['user', user?.id],
  });

  // Mettre à jour les items de navigation uniquement côté client après l'hydratation
  useEffect(() => {
    if (!user || !data?.profile) {
      setNavItems([]);
      return;
    }

    const profile = data.profile;
    const items: NavItem[] = [];

    if (profile?.role === 'professional') {
      items.push({
        href: '/admin/planning',
        icon: 'planning',
        label: 'planning',
      });
      items.push({
        href: '/admin/report',
        icon: 'report',
        label: 'report',
      });
      items.push({
        href: '/admin/structure',
        icon: 'structure',
        label: 'structure',
      });
    }

    setNavItems(items);
  }, [user, data?.profile]);

  // Toujours retourner un tableau vide au premier render pour éviter les problèmes d'hydratation
  // Les items seront mis à jour dans useEffect après l'hydratation
  return navItems;
}
