import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    createdAt: t('createdAt'),
    endDate: t('endDate'),
    next: t('next'),
    noResults: t('noResults'),
    of: t('of'),
    page: t('page'),
    previous: t('previous'),
    professional: t('professional'),
    startDate: t('startDate'),
    status: t('status'),
    structure: t('structure'),
    titleColumn: t('titleColumn'),
    view: t('view'),
  };

  return (
    <div className='min-h-screen space-y-8 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:p-8'>
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
      <Card>
        <CardHeader>
          <CardTitle>{t('tableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MissionsTableWrapper locale={locale} translations={translations} />
        </CardContent>
      </Card>
    </div>
  );
}
