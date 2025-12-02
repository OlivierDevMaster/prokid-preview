import type { Metadata } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Geist } from 'next/font/google';
import { notFound } from 'next/navigation';

import { AuthSessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/sonner';
import { routing } from '@/i18n/routing';

import ConditionalWrapper from '../../components/layout/conditional-wrapper';
import QueryProvider from '../../components/providers/query-provider';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  description: 'The fastest way to build apps with Next.js and Supabase',
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
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
