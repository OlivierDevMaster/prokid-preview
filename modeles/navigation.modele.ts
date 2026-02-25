export type SidebarNavItem = {
  /**
   * Optional static badge count for UI elements (e.g. message count).
   * This is purely visual and does not trigger any data fetching.
   */
  badgeCount?: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};
