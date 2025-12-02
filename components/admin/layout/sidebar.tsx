'use client';

import { Calendar, ChevronDown, LayoutDashboard } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useGetAdminNavItems from '@/hooks/admin/useGetAdminNavItems';
import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

// Mapping des icônes
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  planning: Calendar,
};

export function AdminSidebar() {
  const t = useTranslations('admin');
  const title = useTranslations('title');
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // S'assurer que le composant est monté côté client avant d'afficher les items dynamiques
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname?.startsWith(href);
  };

  const navItems = useGetAdminNavItems();

  return (
    <aside className='flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white'>
      {/* Logo Section */}
      <div className='border-b border-gray-200 p-6'>
        <Link href='/'>
          <h1 className='text-xl font-bold text-gray-900'>
            {title('project')}
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-1 p-4' suppressHydrationWarning>
        {mounted &&
          navItems.map(item => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const active = isActive(item.href);
            return (
              <Link
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                href={item.href}
                key={item.href}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    active ? 'text-green-600' : 'text-gray-500'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* User Section */}
      <div className='border-t border-gray-200 p-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className='h-auto w-full justify-start gap-3 p-2 hover:bg-gray-50'
              variant='ghost'
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white'>
                {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className='min-w-0 flex-1 text-left'>
                <p className='truncate text-sm font-medium text-gray-900'>
                  {session?.user?.email || 'User'}
                </p>
              </div>
              <ChevronDown className='h-4 w-4 text-gray-500' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuItem className='text-red-600' onClick={handleSignOut}>
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
