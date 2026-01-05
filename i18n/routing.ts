import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  defaultLocale: 'fr',
  localePrefix: 'always',
  locales: ['fr'],
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
