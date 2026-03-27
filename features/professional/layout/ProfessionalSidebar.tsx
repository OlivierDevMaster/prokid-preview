'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

import { BoSidebar } from '@/features/layout/BoSidebar';
import { useNotificationUnreadCount } from '@/features/notifications/hooks/useUnreadCount';

import useGetProfessionalNavItems from '../hooks/useGetProfessionalNavItems';

type ProfessionalSidebarProps = {
  expanded?: boolean;
};

export function ProfessionalSidebar({
  expanded,
}: ProfessionalSidebarProps = {}) {
  const navItems = useGetProfessionalNavItems();
  const { data: session } = useSession();
  const { data: unreadCount = 0 } = useNotificationUnreadCount(
    session?.user?.id ?? ''
  );

  const itemsWithBadges = useMemo(() => {
    return navItems.map(item => {
      if (item.href === '/professional/notifications' && unreadCount > 0) {
        return { ...item, badgeCount: unreadCount };
      }
      return item;
    });
  }, [navItems, unreadCount]);

  return <BoSidebar expanded={expanded} navItems={itemsWithBadges} />;
}
