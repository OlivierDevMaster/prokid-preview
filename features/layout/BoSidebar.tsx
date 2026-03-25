'use client';

import { LogOutIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRole } from '@/hooks/useRole';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from '@/modeles/navigation.modele';

type BoSidebarProps = {
  /** Full-width row layout with visible labels (e.g. mobile sheet). */
  expanded?: boolean;
  navItems: SidebarNavItem[];
};

export function BoSidebar({ expanded = false, navItems }: BoSidebarProps) {
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

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-blue-100 bg-gradient-to-b from-blue-50/80 to-white',
        expanded ? 'w-full min-w-0' : 'w-[4.5rem]'
      )}
    >
      {/* Brand */}
      <Link
        className={cn(
          'transition-colors hover:bg-blue-50/60',
          expanded
            ? 'flex flex-row items-center gap-3 px-4 pb-3 pt-4'
            : 'flex flex-col items-center gap-1 px-2 pb-3 pt-4'
        )}
        href={
          isAdmin
            ? '/admin/dashboard'
            : isProfessional
              ? '/professional/dashboard'
              : isStructure
                ? '/structure/dashboard'
                : '/auth/login'
        }
        title={projectName}
      >
        <Image
          alt='ProKid Logo'
          className='h-9 w-9 shrink-0 rounded-2xl'
          height={36}
          src='/icons/logo-bg-dark-blue-circle.svg'
          unoptimized
          width={36}
        />
        {expanded ? (
          <span className='min-w-0 flex-1'>
            <span className='block truncate text-sm font-semibold text-gray-900'>
              {projectName}
            </span>
            {roleBadgeLabel ? (
              <span
                className={cn(
                  'mt-1 inline-flex items-center self-start rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  roleBadgeStyles
                )}
              >
                {roleBadgeLabel}
              </span>
            ) : null}
          </span>
        ) : (
          roleBadgeLabel && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                roleBadgeStyles
              )}
            >
              {roleBadgeLabel}
            </span>
          )
        )}
      </Link>

      {/* Navigation */}
      <nav
        className={cn(
          'flex-1 space-y-1 overflow-y-auto pb-4 pt-1',
          expanded ? 'px-3' : 'px-2'
        )}
        suppressHydrationWarning
      >
        <TooltipProvider delayDuration={0}>
          {mounted &&
            navItems.map(item => {
              const active = isActive(item.href);
              const badgeCount = item.badgeCount;

              const linkClassName = cn(
                'rounded-xl text-sm font-medium transition-colors',
                expanded
                  ? cn(
                      'flex w-full min-w-0 flex-row items-center gap-3 px-3 py-2.5',
                      active
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50/60'
                    )
                  : cn(
                      'mx-auto flex size-12 flex-col items-center justify-center gap-1 px-2 py-2.5',
                      active
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50/60'
                    )
              );

              const linkInner = (
                <>
                  <span className='relative inline-flex shrink-0'>
                    <item.icon
                      className={cn(
                        'h-5 w-5',
                        active ? 'text-blue-700' : 'text-gray-500'
                      )}
                    />
                    {typeof badgeCount === 'number' && badgeCount > 0 && (
                      <span
                        className={cn(
                          'absolute flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold text-white',
                          expanded ? '-right-1 -top-1.5' : '-right-2 -top-2'
                        )}
                      >
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </span>
                  {expanded ? (
                    <span className='min-w-0 flex-1 truncate'>
                      {item.label}
                    </span>
                  ) : null}
                </>
              );

              if (expanded) {
                return (
                  <Link
                    className={linkClassName}
                    href={item.href}
                    key={item.href}
                  >
                    {linkInner}
                  </Link>
                );
              }

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link className={linkClassName} href={item.href}>
                      {linkInner}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side='right' sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
        </TooltipProvider>
      </nav>

      {/* User Section */}
      <div
        className={cn(
          'border-t border-blue-100 bg-white/60',
          expanded ? 'p-3' : 'p-2'
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={session?.user?.email ?? 'User menu'}
              className={cn(
                'h-auto w-full rounded-xl bg-gray-50 hover:bg-gray-100',
                expanded
                  ? 'justify-start gap-3 px-3 py-2'
                  : 'justify-center p-2'
              )}
              title={session?.user?.email ?? undefined}
              variant='ghost'
            >
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white'>
                {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              {expanded ? (
                <span className='min-w-0 flex-1 truncate text-left text-sm text-gray-700'>
                  {session?.user?.email ?? '—'}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' alignOffset={10}>
            <DropdownMenuItem onClick={handleSignOut} variant='destructive'>
              <LogOutIcon className='text-destructive' />
              {tAdmin('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
