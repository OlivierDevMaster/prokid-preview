import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // cacheComponents: true, // Disabled to allow dynamic authentication routes
};

export default withNextIntl(nextConfig);
