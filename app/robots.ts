import { MetadataRoute } from 'next';

import { getAppUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();
  const locale = 'fr';

  // Build allowed paths
  const allowedPaths: string[] = [];

  // Home page
  allowedPaths.push(`/${locale}/`);

  // Auth pages
  allowedPaths.push(`/${locale}/auth/*`);

  // Professionals pages (including nested routes)
  allowedPaths.push(`/${locale}/professionals/*`);

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
