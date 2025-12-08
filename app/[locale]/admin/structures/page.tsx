import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddStructureButton } from '@/features/admin/structures/components/AddStructureButton';
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
    next: t('next'),
    noResults: t('noResults'),
    of: t('of'),
    page: t('page'),
    previous: t('previous'),
    view: t('view'),
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      <div className='flex w-full justify-end'>
        <AddStructureButton />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <StructuresTableWrapper locale={locale} translations={translations} />
        </CardContent>
      </Card>
    </div>
  );
}
