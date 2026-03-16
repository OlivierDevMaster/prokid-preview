'use client';

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
import { LogOutIcon } from 'lucide-react';

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
    <aside className='flex h-full w-[4.5rem] flex-col border-r border-blue-100 bg-gradient-to-b from-blue-50/80 to-white'>
      {/* Brand */}
      <Link
        className='flex flex-col items-center gap-1 px-2 pb-3 pt-4 transition-colors hover:bg-blue-50/60'
        href='/'
        title={projectName}
      >
        <div className='flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-sm'>
          {projectInitial}
        </div>
        {roleBadgeLabel && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
              roleBadgeStyles
            )}
          >
            {roleBadgeLabel}
          </span>
        )}
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
                  'mx-auto flex size-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:bg-blue-50/60'
                )}
                href={item.href}
                key={item.href}
                title={item.label}
              >
                <span className='relative inline-flex'>
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      active ? 'text-blue-700' : 'text-gray-500'
                    )}
                  />
                  {typeof badgeCount === 'number' && badgeCount > 0 && (
                    <span className='absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold text-white'>
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
      </nav>

      {/* User Section */}
      <div className='border-t border-blue-100 bg-white/60 p-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={session?.user?.email ?? 'User menu'}
              className='h-auto w-full justify-center rounded-xl bg-gray-50 p-2 hover:bg-gray-100'
              title={session?.user?.email ?? undefined}
              variant='ghost'
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white'>
                {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' alignOffset={10}>
            <DropdownMenuItem variant='destructive' onClick={handleSignOut}>
              <LogOutIcon className='text-destructive' />
              {tAdmin('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
