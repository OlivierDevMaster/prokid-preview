'use client';

import { BoSidebar } from '@/features/layout/BoSidebar';

import useGetAdminNavItems from '../hooks/useGetAdminNavItems';

export function AdminSidebar() {
  const navItems = useGetAdminNavItems();

  return <BoSidebar navItems={navItems} />;
}
