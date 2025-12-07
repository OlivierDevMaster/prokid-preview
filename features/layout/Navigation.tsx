'use client';

import { Menu, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function Navigation() {
  const t = useTranslations('navigation');
  const title = useTranslations('title');
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/professional', label: t('professionals') },
    { href: '/how-it-works', label: t('howItWorks') },
  ];

  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center gap-8'>
            <Link className='flex items-center space-x-2' href='/'>
              <span className='text-xl font-bold'>{title('project')}</span>
            </Link>
          </div>

          <div className='hidden md:flex md:items-center md:gap-6'>
            {navItems.map(item => (
              <Link
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className='flex items-center gap-4'>
            <ThemeSwitcher />

            {session ? (
              <div className='hidden md:flex md:items-center md:gap-4'>
                <span className='text-sm text-muted-foreground'>
                  {session.user?.email}
                </span>
              </div>
            ) : (
              <div className='hidden md:flex md:items-center md:gap-2'>
                <Button asChild size='sm' variant='ghost'>
                  <Link href='/auth/login'>{t('signIn')}</Link>
                </Button>
                <Button asChild size='sm'>
                  <Link href='/auth/sign-up'>{t('signUp')}</Link>
                </Button>
              </div>
            )}

            <Button
              className='md:hidden'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size='icon'
              variant='ghost'
            >
              {mobileMenuOpen ? (
                <X className='h-5 w-5' />
              ) : (
                <Menu className='h-5 w-5' />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className='border-t md:hidden'>
            <div className='space-y-1 px-2 pb-3 pt-2'>
              {navItems.map(item => (
                <Link
                  className={cn(
                    'block rounded-md px-3 py-2 text-base font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {session ? (
                <div className='space-y-1 px-2 pt-2'>
                  <div className='px-3 py-2 text-sm text-muted-foreground'>
                    {session.user?.email}
                  </div>
                  <Link
                    className='block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    href='/protected'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                </div>
              ) : (
                <div className='space-y-1 px-2 pt-2'>
                  <Link
                    className='block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    href='/auth/login'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('signIn')}
                  </Link>
                  <Link
                    className='block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    href='/auth/sign-up'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
