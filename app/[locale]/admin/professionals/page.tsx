import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddProfessionalButton } from '@/features/admin/professionals/components/AddProfessionalButton';
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
    delete: t('delete'),
    edit: t('edit'),
    email: t('email'),
    name: t('name'),
    next: t('next'),
    noResults: t('noResults'),
    of: t('of'),
    page: t('page'),
    previous: t('previous'),
    skills: t('skills'),
    view: t('view'),
  };

  return (
    <div className='space-y-8 bg-blue-50/30 p-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      <div className='flex w-full justify-end'>
        <AddProfessionalButton />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfessionalsTableWrapper
            locale={locale}
            translations={translations}
          />
        </CardContent>
      </Card>
    </div>
  );
}
