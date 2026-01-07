import { getTranslations } from 'next-intl/server';

import { StructureInvitationsPageWrapper } from '@/features/structure/invitations/components/StructureInvitationsPageWrapper';

export default async function StructureInvitationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'structure.invitations',
  });

  const translations = {
    actions: t('actions'),
    allProfessionals: t('allProfessionals'),
    allStatuses: t('allStatuses'),
    cancel: t('cancel'),
    cancelError: t('cancelError'),
    cancelSuccess: t('cancelSuccess'),
    createdAt: t('createdAt'),
    delete: t('delete'),
    deleteError: t('deleteError'),
    deleteSuccess: t('deleteSuccess'),
    filterByProfessional: t('filterByProfessional'),
    filterByStatus: t('filterByStatus'),
    loading: t('loading'),
    name: t('name'),
    noActions: t('noActions'),
    noResults: t('noResults'),
    status: t('status'),
    subtitle: t('subtitle'),
    title: t('title'),
    unknownProfessional: t('unknownProfessional'),
  };

  return (
    <StructureInvitationsPageWrapper
      locale={locale}
      translations={translations}
    />
  );
}
