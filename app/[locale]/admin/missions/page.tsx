import { getTranslations } from 'next-intl/server';

import { MissionsTableWrapper } from '@/features/admin/missions/components/MissionsTableWrapper';

export default async function MissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.missions' });

  const translations = {
    actions: t('actions'),
    allStatuses: t('allStatuses'),
    clearFilters: t('clearFilters'),
    createdAt: t('createdAt'),
    endDate: t('endDate'),
    filterByStatus: t('filterByStatus'),
    newest: t('newest'),
    next: t('next'),
    noResults: t('noResults'),
    of: t('of'),
    oldest: t('oldest'),
    page: t('page'),
    previous: t('previous'),
    professional: t('professional'),
    searchPlaceholder: t('searchPlaceholder'),
    sortBy: t('sortBy'),
    startDate: t('startDate'),
    status: t('status'),
    structure: t('structure'),
    titleAsc: t('titleAsc'),
    titleColumn: t('titleColumn'),
    titleDesc: t('titleDesc'),
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
      <div className='min-w-0 overflow-x-auto'>
        <MissionsTableWrapper
          locale={locale as 'en' | 'fr'}
          translations={translations}
        />
      </div>
    </div>
  );
}
