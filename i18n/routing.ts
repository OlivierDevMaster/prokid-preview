import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  defaultLocale: 'en',
  locales: ['en', 'fr'],
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
