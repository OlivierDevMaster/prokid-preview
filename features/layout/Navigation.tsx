'use client';

import { Menu, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { LanguageSwitcher } from '@/components/language-switcher';
// import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';
import { useRouter } from '@/i18n/routing';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import ProkidLogo from './ProkidLogo';

export function Navigation() {
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { isAdmin, isProfessional, isStructure } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/professionals', label: t('professionals') },
    { href: '/faq', label: t('howItWorks') },
  ];

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleDashboard = async () => {
    setMobileMenuOpen(false);
    if (isAdmin) {
      await router.push('/admin/dashboard');
    } else if (isProfessional) {
      await router.push('/professional/dashboard');
    } else if (isStructure) {
      await router.push('/structure/dashboard');
    }
  };

  // Helper function to check if a path is active
  const isActive = (href: string) => {
    if (!pathname) return false;
    // Remove trailing slashes and query params for comparison
    const normalizedPathname = pathname.split('?')[0].replace(/\/$/, '');
    const normalizedHref = href.replace(/\/$/, '');
    return (
      normalizedPathname === normalizedHref ||
      normalizedPathname.startsWith(`${normalizedHref}/`)
    );
  };

  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center gap-8'>
            <Link className='flex items-center space-x-2' href='/'>
              <ProkidLogo />
            </Link>
          </div>

          <div className='hidden md:flex md:items-center md:gap-6'>
            {navItems.map(item => (
              <Link
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive(item.href)
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
            {/* <ThemeSwitcher /> */}
            <LanguageSwitcher />

            {session ? (
              <div className='hidden md:flex md:items-center md:gap-4'>
                <span className='text-sm text-muted-foreground'>
                  {session.user?.email}
                </span>
                <Button
                  className='bg-blue-500 text-white hover:bg-blue-600'
                  onClick={handleDashboard}
                  size='sm'
                >
                  {tCommon('label.dashboard')}
                </Button>
                <Button onClick={handleSignOut} size='sm' variant='outline'>
                  {tCommon('actions.signOut')}
                </Button>
              </div>
            ) : (
              <div className='hidden md:flex md:items-center md:gap-2'>
                <Button asChild size='sm' variant='ghost'>
                  <Link href='/auth/login'>{t('signIn')}</Link>
                </Button>
                <Button asChild size='sm' variant='outline'>
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
            <div className='space-y-1 pb-3 pt-2 lg:px-2'>
              {navItems.map(item => (
                <Link
                  className={cn(
                    'block rounded-md px-3 py-2 text-base font-medium transition-colors',
                    isActive(item.href)
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
                <div className='space-y-1 pt-2 lg:px-2'>
                  <div className='px-3 py-2 text-sm text-muted-foreground'>
                    {session.user?.email}
                  </div>
                  <Button
                    className='mr-2'
                    onClick={handleDashboard}
                    size='sm'
                    variant='outline'
                  >
                    {tCommon('label.dashboard')}
                  </Button>
                  <Button onClick={handleSignOut} size='sm' variant='outline'>
                    {tCommon('actions.signOut')}
                  </Button>
                </div>
              ) : (
                <div className='space-y-1 pt-2 lg:px-2'>
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
