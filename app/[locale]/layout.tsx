import type { Metadata } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Geist } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';
import ConditionalWrapper from '@/features/layout/ConditionalWrapper';
import QueryProvider from '@/features/providers/QueryProvider';
import { AuthSessionProvider } from '@/features/providers/SessionProvider';
import { routing } from '@/i18n/routing';
import { OrganizationSchema, WebSiteSchema } from '@/lib/seo/structured-data';
import { getAppUrl } from '@/lib/utils';

const appUrl = getAppUrl();

export const metadata: Metadata = {
  applicationName: 'ProKid',
  authors: [{ name: 'ProKid' }],
  description: 'La plateforme des pros de la petite enfance',
  icons: {
    apple: '/icons/logo-bg-dark-blue-circle.svg',
    icon: '/icons/logo-bg-dark-blue-circle.svg',
    shortcut: '/icons/logo-bg-dark-blue-circle.svg',
  },
  keywords: [
    'petite enfance',
    'professionnel',
    "garde d'enfants",
    'crèche',
    'assistant maternel',
    'early childhood',
    'childcare',
  ],
  metadataBase: new URL(appUrl),
  openGraph: {
    description: 'La plateforme des pros de la petite enfance',
    images: [
      {
        alt: 'ProKid - La plateforme des pros de la petite enfance',
        height: 630,
        url: '/opengraph-image.png',
        width: 1200,
      },
    ],
    locale: 'fr_FR',
    siteName: 'ProKid',
    title: 'ProKid - La plateforme des pros de la petite enfance',
    type: 'website',
    url: appUrl,
  },
  title: {
    default: 'ProKid - La plateforme des pros de la petite enfance',
    template: '%s | ProKid',
  },
  twitter: {
    card: 'summary_large_image',
    description: 'La plateforme des pros de la petite enfance',
    images: ['/twitter-image.png'],
    title: 'ProKid - La plateforme des pros de la petite enfance',
  },
};

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html>
      <head>
        <OrganizationSchema appUrl={appUrl} />
        <WebSiteSchema appUrl={appUrl} />
      </head>
      <body
        className={`${geistSans.variable} ${geistSans.className} antialiased`}
      >
        <AuthSessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NuqsAdapter>
              <QueryProvider>
                <ThemeProvider
                  attribute='class'
                  defaultTheme='light'
                  disableTransitionOnChange
                  enableSystem
                >
                  <ConditionalWrapper>{children}</ConditionalWrapper>
                  <Toaster />
                </ThemeProvider>
              </QueryProvider>
            </NuqsAdapter>
          </NextIntlClientProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
