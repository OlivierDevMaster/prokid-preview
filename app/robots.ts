import { MetadataRoute } from 'next';

import { getAppUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();
  const locales = ['fr', 'en'];

  // Build allowed paths
  const allowedPaths: string[] = [];

  // Home page
  locales.forEach(locale => {
    allowedPaths.push(`/${locale}/`);
  });

  // Auth pages
  locales.forEach(locale => {
    allowedPaths.push(`/${locale}/auth/*`);
  });

  // Professionals pages (including nested routes)
  locales.forEach(locale => {
    allowedPaths.push(`/${locale}/professionals/*`);
  });

  return {
    rules: [
      {
        allow: allowedPaths,
        disallow: [
          '/api/',
          '/admin/',
          '/professional/',
          '/structure/',
          '/_next/',
          '/test-',
        ],
        userAgent: '*',
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
