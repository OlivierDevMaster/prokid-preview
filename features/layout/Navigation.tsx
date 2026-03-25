'use client';

import { Menu, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

// import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import ProkidLogo from './ProkidLogo';

export function Navigation() {
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const {
    isAdmin,
    isLoading: isLoadingRole,
    isProfessional,
    isStructure,
  } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = useMemo(() => {
    if (isProfessional) return [];

    const professionalsHref = isStructure
      ? '/structure/search'
      : '/professionals';

    return [{ href: professionalsHref, label: t('professionals') }];
  }, [isProfessional, isStructure, t]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Cleanup: close mobile menu on unmount to prevent portal issues
  useEffect(() => {
    return () => {
      setMobileMenuOpen(false);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const handleDashboard = () => {
    setMobileMenuOpen(false);

    // Don't navigate if roles are still loading
    if (isLoadingRole) {
      return;
    }

    // Determine the dashboard path based on role
    let dashboardPath = '/';
    if (isAdmin) {
      dashboardPath = '/admin/dashboard';
    } else if (isProfessional) {
      dashboardPath = '/professional/dashboard';
    } else if (isStructure) {
      dashboardPath = '/structure/dashboard';
    }

    // Use window.location.href for reliable navigation
    // This works even when the component is unmounting (e.g., from /professionals)
    // router.push from next-intl might not complete if component unmounts
    const fullPath = `/${locale}${dashboardPath}`;
    window.location.href = fullPath;
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
    <nav className='sticky top-0 z-50 w-full border-b border-slate-200 bg-white'>
      <div className='px-6 md:px-10'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between'>
          {/* Left: Logo + Nav links */}
          <div className='flex items-center gap-8'>
            <Link className='flex items-center' href='/auth/login'>
              <ProkidLogo />
            </Link>
            <div className='hidden items-center gap-1 md:flex'>
              {navItems.map(item => (
                <Link
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Auth buttons */}
          <div className='flex items-center gap-3'>
            {session ? (
              <div className='hidden items-center gap-3 md:flex'>
                <Button
                  className='flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50'
                  onClick={handleDashboard}
                >
                  {tCommon('label.dashboard')}
                </Button>
                <Button
                  className='flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50'
                  onClick={handleSignOut}
                >
                  {tCommon('actions.signOut')}
                </Button>
              </div>
            ) : (
              <div className='hidden items-center gap-3 md:flex'>
                <Button
                  asChild
                  className='flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50'
                >
                  <Link href='/auth/login'>{t('signIn')}</Link>
                </Button>
                <Button
                  asChild
                  className='flex h-11 items-center rounded-xl bg-[#4A90E2] px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90'
                >
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className='border-t border-slate-200 pb-4 pt-2 md:hidden'>
            <div className='space-y-1'>
              {navItems.map(item => (
                <Link
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className='border-t border-slate-100 pt-2'>
                {session ? (
                  <div className='flex flex-col gap-2 px-3'>
                    <Button
                      className='h-11 w-full justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm'
                      onClick={handleDashboard}
                    >
                      {tCommon('label.dashboard')}
                    </Button>
                    <Button
                      className='h-11 w-full justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm'
                      onClick={handleSignOut}
                    >
                      {tCommon('actions.signOut')}
                    </Button>
                  </div>
                ) : (
                  <div className='flex flex-col gap-2 px-3'>
                    <Link href='/auth/login' onClick={() => setMobileMenuOpen(false)}>
                      <Button className='h-11 w-full justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm'>
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link href='/auth/sign-up' onClick={() => setMobileMenuOpen(false)}>
                      <Button className='h-11 w-full justify-center rounded-xl bg-[#4A90E2] text-sm font-semibold text-white shadow-sm'>
                        {t('signUp')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
