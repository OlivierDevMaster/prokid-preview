import { useLocale } from 'next-intl';

import { redirect } from '@/i18n/routing';

export default function StructurePage() {
  const locale = useLocale();
  redirect({ href: '/structure/dashboard', locale });
}
