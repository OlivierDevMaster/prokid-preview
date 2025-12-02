import { getTranslations } from 'next-intl/server';

import { ReportsList } from '@/components/admin/report/ReportsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ReportsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.reports');

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportsList locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
