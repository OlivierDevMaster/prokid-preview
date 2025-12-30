import type { Metadata } from 'next';

import { ArrowLeft, HelpCircle, Home, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { routing } from '@/i18n/routing';
import { Link as I18nLink } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const resolvedParams = params ? await params : {};
  // Try to get locale from params, otherwise from URL
  const locale = resolvedParams.locale || (await getLocaleFromUrl());
  const t = await getTranslations({ locale, namespace: 'notFound' });

  const title = t('title');
  const description = t('description');

  return {
    description,
    robots: {
      follow: true,
      index: false,
    },
    title,
  };
}

export default async function NotFound({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const resolvedParams = params ? await params : {};
  // Try to get locale from params, otherwise from URL
  const locale = resolvedParams.locale || (await getLocaleFromUrl());
  const t = await getTranslations({ locale, namespace: 'notFound' });

  const navigationLinks = [
    {
      href: '/',
      icon: Home,
      label: t('links.home'),
    },
    {
      href: '/professionals',
      icon: Search,
      label: t('links.professionals'),
    },
    {
      href: '/faq',
      icon: HelpCircle,
      label: t('links.faq'),
    },
  ];

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-2xl text-center'>
        <div className='mb-8'>
          <h1 className='mb-4 text-6xl font-bold text-gray-900 sm:text-8xl'>
            404
          </h1>
          <h2 className='mb-4 text-3xl font-bold text-gray-800 sm:text-4xl'>
            {t('title')}
          </h2>
          <p className='mx-auto max-w-md text-lg text-gray-600'>
            {t('description')}
          </p>
        </div>

        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>{t('helpfulLinks')}</CardTitle>
            <CardDescription>{t('helpfulLinksDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              {navigationLinks.map(link => {
                const Icon = link.icon;
                return (
                  <I18nLink href={link.href} key={link.href}>
                    <Button
                      className='w-full justify-start gap-2'
                      variant='outline'
                    >
                      <Icon className='h-4 w-4' />
                      {link.label}
                    </Button>
                  </I18nLink>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
          <I18nLink href='/'>
            <Button className='gap-2' size='lg'>
              <ArrowLeft className='h-4 w-4' />
              {t('backToHome')}
            </Button>
          </I18nLink>
          <I18nLink href='/professionals'>
            <Button className='gap-2' size='lg' variant='outline'>
              <Search className='h-4 w-4' />
              {t('browseProfessionals')}
            </Button>
          </I18nLink>
        </div>
      </div>
    </main>
  );
}

async function getLocaleFromUrl(): Promise<string> {
  const headersList = await headers();

  // List of headers that might contain the pathname
  const headerNames = [
    'x-pathname',
    'x-invoke-path',
    'x-middleware-invoke-path',
    'referer',
    'x-url',
  ];

  for (const headerName of headerNames) {
    const headerValue = headersList.get(headerName);
    if (!headerValue) {
      continue;
    }

    try {
      let pathname = '';

      // If it's a full URL (referer), extract pathname
      if (headerValue.startsWith('http')) {
        const url = new URL(headerValue);
        pathname = url.pathname;
      } else {
        // Otherwise, assume it's already a pathname
        pathname = headerValue;
      }

      // Extract locale from pathname (e.g., /en/... or /fr/...)
      const segments = pathname.split('/').filter(Boolean);
      const firstSegment = segments[0];

      // Check if first segment is a valid locale
      if (
        firstSegment &&
        routing.locales.includes(
          firstSegment as (typeof routing.locales)[number]
        )
      ) {
        return firstSegment;
      }
    } catch {
      // Ignore parsing errors, try next header
      continue;
    }
  }

  return routing.defaultLocale;
}
