'use client';

import { BoSidebar } from '@/features/layout/BoSidebar';

import useGetProfessionalNavItems from '../hooks/useGetProfessionalNavItems';

export function ProfessionalSidebar() {
  const navItems = useGetProfessionalNavItems();

  return <BoSidebar navItems={navItems} />;
}
