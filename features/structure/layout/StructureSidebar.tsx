'use client';

import { BoSidebar } from '@/features/layout/BoSidebar';

import { useGetStructureSidebarItems } from '../hooks/useGetStructureSidebarItems';

type StructureSidebarProps = {
  expanded?: boolean;
};

export function StructureSidebar({ expanded }: StructureSidebarProps = {}) {
  const navItems = useGetStructureSidebarItems();
  return <BoSidebar expanded={expanded} navItems={navItems} />;
}
