import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { getAppUrl } from '@/lib/utils';

import { FAQSchema } from './FAQSchema';

export default async function FAQLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <FAQSchema locale={locale} />
      {children}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  const appUrl = getAppUrl();

  const title = t('title');
  const description =
    'Frequently asked questions about ProKid - Find answers about our platform for early childhood professionals';
  const canonicalUrl = `${appUrl}/${locale}/faq`;
  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const otherLocaleUrl = `${appUrl}/${otherLocale}/faq`;

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        [locale]: canonicalUrl,
        [otherLocale]: otherLocaleUrl,
      },
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: title,
          height: 630,
          url: `${appUrl}/opengraph-image.png`,
          width: 1200,
        },
      ],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      siteName: 'ProKid',
      title,
      type: 'website',
      url: canonicalUrl,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [`${appUrl}/twitter-image.png`],
      title,
    },
  };
}
