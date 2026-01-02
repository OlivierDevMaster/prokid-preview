import { getTranslations } from 'next-intl/server';

import { ProfessionalsTableWrapper } from '@/features/admin/professionals/components/ProfessionalsTableWrapper';

export default async function ProfessionalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.professionals' });

  const translations = {
    actions: t('actions'),
    city: t('city'),
    createdAt: t('createdAt'),
    currentJob: t('currentJob'),
    delete: t('delete'),
    edit: t('edit'),
    email: t('email'),
    name: t('name'),
    next: t('next'),
    noResults: t('noResults'),
    of: t('of'),
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
      <ProfessionalsTableWrapper locale={locale} translations={translations} />
    </div>
  );
}
