'use client';

import { ChevronDown } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRole } from '@/hooks/useRole';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from '@/modeles/navigation.modele';

type BoSidebarProps = {
  navItems: SidebarNavItem[];
};

export function BoSidebar({ navItems }: BoSidebarProps) {
  const tAdmin = useTranslations('admin');
  const tTitle = useTranslations('title');
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAdmin, isProfessional, isStructure } = useRole();

  // Ensure component is mounted on client before rendering dynamic items
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname?.startsWith(href);
  };

  const roleBadgeLabel = (() => {
    if (isProfessional) return 'Pro';
    if (isStructure) return 'Structure';
    if (isAdmin) return 'Admin';
    return null;
  })();

  const roleBadgeStyles =
    roleBadgeLabel === 'Structure'
      ? 'bg-purple-100 text-purple-700'
      : roleBadgeLabel === 'Pro'
        ? 'bg-emerald-100 text-emerald-700'
        : roleBadgeLabel === 'Admin'
          ? 'bg-amber-100 text-amber-700'
          : '';

  const projectName = tTitle('project');
  const projectInitial = projectName?.charAt(0).toUpperCase() || 'P';

  return (
    <aside className='flex h-full w-64 flex-col border-r border-blue-100 bg-gradient-to-b from-blue-50/80 to-white'>
      {/* Brand */}
      <Link
        className='flex items-center gap-3 px-4 pb-3 pt-4 transition-colors hover:bg-blue-50/60'
        href='/'
      >
        <div className='flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-sm'>
          {projectInitial}
        </div>
        <div className='flex flex-1 items-center justify-between gap-2'>
          <div className='flex flex-col'>
            <span className='text-xl font-semibold text-blue-900'>
              {projectName}
            </span>
          </div>
          {roleBadgeLabel && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
                roleBadgeStyles
              )}
            >
              {roleBadgeLabel}
            </span>
          )}
        </div>
      </Link>

      {/* Navigation */}
      <nav
        className='flex-1 space-y-1 overflow-y-auto px-2 pb-4 pt-1'
        suppressHydrationWarning
      >
        {mounted &&
          navItems.map(item => {
            const active = isActive(item.href);
            const badgeCount = item.badgeCount;

            return (
              <Link
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:bg-blue-50/60'
                )}
                href={item.href}
                key={item.href}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    active ? 'text-blue-700' : 'text-gray-500'
                  )}
                />
                <span className='flex-1 truncate'>{item.label}</span>
                {typeof badgeCount === 'number' && badgeCount > 0 && (
                  <span className='ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-semibold text-white'>
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* User Section */}
      <div className='border-t border-blue-100 bg-white/60 p-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className='h-auto w-full justify-start gap-3 rounded-xl bg-gray-50 p-2 text-left hover:bg-gray-100'
              variant='ghost'
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white'>
                {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-gray-900'>
                  {session?.user?.email || 'User'}
                </p>
              </div>
              <ChevronDown className='h-4 w-4 text-gray-500' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuItem className='text-red-600' onClick={handleSignOut}>
              {tAdmin('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
