import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import ProfessionalsPage from '@/features/professionals/components/ProfessionalsPage';
import { getAppUrl } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'professional' });
  const appUrl = getAppUrl();

  const title = t('title');
  const description = t('subtitle');
  const canonicalUrl = `${appUrl}/${locale}/professionals`;
  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const otherLocaleUrl = `${appUrl}/${otherLocale}/professionals`;

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

export default function ProfessionalsPageComponent() {
  return <ProfessionalsPage />;
}
