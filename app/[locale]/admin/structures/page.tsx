import { getTranslations } from 'next-intl/server';

import { StructuresTableWrapper } from '@/features/admin/structures/components/StructuresTableWrapper';

export default async function StructuresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.structures' });

  const translations = {
    actions: t('actions'),
    createdAt: t('createdAt'),
    delete: t('delete'),
    edit: t('edit'),
    email: t('email'),
    name: t('name'),
    nameAsc: t('nameAsc'),
    nameDesc: t('nameDesc'),
    newest: t('newest'),
    next: t('next'),
    noResults: t('noResults'),
    of: t('of'),
    oldest: t('oldest'),
    page: t('page'),
    previous: t('previous'),
    view: t('view'),
  };

  return (
    <div className='space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          {t('title')}
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          {t('subtitle')}
        </p>
      </div>

      {/* Table */}
      <StructuresTableWrapper locale={locale} translations={translations} />
    </div>
  );
}
