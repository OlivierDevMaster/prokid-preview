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
    createdAt: t('createdAt'),
    decline: t('decline'),
    declineError: t('declineError'),
    declineSuccess: t('declineSuccess'),
    description: t('description'),
    name: t('name'),
    noActions: t('noActions'),
    noResults: t('noResults'),
    status: t('status'),
    subtitle: t('subtitle'),
    title: t('title'),
  };

  return <InvitationsPageWrapper locale={locale} translations={translations} />;
}
