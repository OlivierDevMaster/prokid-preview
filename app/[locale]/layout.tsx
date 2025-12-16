import type { Metadata } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Geist } from 'next/font/google';
import { notFound } from 'next/navigation';

import { Toaster } from '@/components/ui/sonner';
import ConditionalWrapper from '@/features/layout/ConditionalWrapper';
import QueryProvider from '@/features/providers/QueryProvider';
import { AuthSessionProvider } from '@/features/providers/SessionProvider';
import { routing } from '@/i18n/routing';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  description: 'La plateforme des pros de la petite enfance',
  icons: {
    apple: '/icons/logo-bg-dark-blue-circle.svg',
    icon: '/icons/logo-bg-dark-blue-circle.svg',
    shortcut: '/icons/logo-bg-dark-blue-circle.svg',
  },
  metadataBase: new URL(defaultUrl),
  title: 'prokid',
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
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistSans.className} antialiased`}
      >
        <AuthSessionProvider>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <ThemeProvider
                attribute='class'
                defaultTheme='system'
                disableTransitionOnChange
                enableSystem
              >
                <ConditionalWrapper>{children}</ConditionalWrapper>
                <Toaster />
              </ThemeProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
