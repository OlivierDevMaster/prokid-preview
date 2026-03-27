'use client';

import { BoSidebar } from '@/features/layout/BoSidebar';

import useGetProfessionalNavItems from '../hooks/useGetProfessionalNavItems';

type ProfessionalSidebarProps = {
  expanded?: boolean;
};

export function ProfessionalSidebar({
  expanded,
}: ProfessionalSidebarProps = {}) {
  const navItems = useGetProfessionalNavItems();
  return <BoSidebar expanded={expanded} navItems={navItems} />;
}
