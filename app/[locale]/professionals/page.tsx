import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { PaginationLinks } from '@/app/[locale]/professionals/PaginationLinks';
import ProfessionalsPage from '@/features/professionals/components/ProfessionalsPage';
import { getAppUrl } from '@/lib/utils';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const t = await getTranslations({ locale, namespace: 'professional' });
  const appUrl = getAppUrl();

  const title = t('title');
  const description = t('subtitle');

  // Build base URL
  const baseUrl = `${appUrl}/${locale}/professionals`;

  // Build canonical URL - page 1 doesn't need page parameter
  const canonicalUrl =
    currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`;

  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const otherLocaleBaseUrl = `${appUrl}/${otherLocale}/professionals`;
  const otherLocaleUrl =
    currentPage === 1
      ? otherLocaleBaseUrl
      : `${otherLocaleBaseUrl}?page=${currentPage}`;

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        [locale]: canonicalUrl,
        [otherLocale]: otherLocaleUrl,
      },
    },
    description,
    // Note: Next.js Metadata API doesn't directly support rel="prev" and rel="next"
    // These will be added via a layout component or head.tsx
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
      title: currentPage > 1 ? `${title} - Page ${currentPage}` : title,
      type: 'website',
      url: canonicalUrl,
    },
    title: currentPage > 1 ? `${title} - Page ${currentPage}` : title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [`${appUrl}/twitter-image.png`],
      title: currentPage > 1 ? `${title} - Page ${currentPage}` : title,
    },
  };
}

export default function ProfessionalsPageComponent() {
  return (
    <>
      <PaginationLinks />
      <ProfessionalsPage />
    </>
  );
}
