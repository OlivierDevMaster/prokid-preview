'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

import { BoSidebar } from '@/features/layout/BoSidebar';
import { useNotificationUnreadCount } from '@/features/notifications/hooks/useUnreadCount';

import { useGetStructureSidebarItems } from '../hooks/useGetStructureSidebarItems';

type StructureSidebarProps = {
  expanded?: boolean;
};

export function StructureSidebar({ expanded }: StructureSidebarProps = {}) {
  const navItems = useGetStructureSidebarItems();
  const { data: session } = useSession();
  const { data: unreadCount = 0 } = useNotificationUnreadCount(
    session?.user?.id ?? ''
  );

  const itemsWithBadges = useMemo(() => {
    return navItems.map(item => {
      if (item.href === '/structure/notifications' && unreadCount > 0) {
        return { ...item, badgeCount: unreadCount };
      }
      return item;
    });
  }, [navItems, unreadCount]);

  return <BoSidebar expanded={expanded} navItems={itemsWithBadges} />;
}
