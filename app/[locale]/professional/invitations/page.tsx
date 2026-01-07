import { getTranslations } from 'next-intl/server';

import { InvitationsPageWrapper } from '@/features/professional/invitations/components/InvitationsPageWrapper';

export default async function InvitationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'professional.invitations',
  });

  const translations = {
    accept: t('accept'),
    acceptError: t('acceptError'),
    acceptSuccess: t('acceptSuccess'),
    actions: t('actions'),
    allStatuses: t('allStatuses'),
    allStructures: t('allStructures'),
    createdAt: t('createdAt'),
    decline: t('decline'),
    declineError: t('declineError'),
    declineSuccess: t('declineSuccess'),
    description: t('description'),
    filterByStatus: t('filterByStatus'),
    filterByStructure: t('filterByStructure'),
    name: t('name'),
    noActions: t('noActions'),
    noResults: t('noResults'),
    status: t('status'),
    subtitle: t('subtitle'),
    title: t('title'),
    unknownStructure: t('unknownStructure'),
  };

  return <InvitationsPageWrapper locale={locale} translations={translations} />;
}
