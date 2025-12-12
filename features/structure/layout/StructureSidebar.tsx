'use client';

import { BoSidebar } from '@/features/layout/BoSidebar';

import { useGetStructureSidebarItems } from '../hooks/useGetStructureSidebarItems';

export function StructureSidebar() {
  const navItems = useGetStructureSidebarItems();
  return <BoSidebar navItems={navItems} />;
}
