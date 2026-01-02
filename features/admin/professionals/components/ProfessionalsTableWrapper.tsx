'use client';

import { useTranslations } from 'next-intl';

import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';

import { ProfessionalsTable } from './ProfessionalsTable';

interface ProfessionalsTableWrapperProps {
  locale: string;
  translations: {
    actions?: string;
    city: string;
    createdAt: string;
    delete?: string;
    edit?: string;
    email: string;
    name: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    skills: string;
    view?: string;
  };
}

export function ProfessionalsTableWrapper({
  locale,
  translations,
}: ProfessionalsTableWrapperProps) {
  const t = useTranslations('common.messages');
  const { data, isLoading } = useFindProfessionals({}, { limit: 1000 });

  const professionals = data?.data ?? [];

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>{t('loading')}</p>;
  }

  if (professionals.length === 0) {
    return (
      <p className='py-8 text-center text-gray-500'>{translations.noResults}</p>
    );
  }

  return (
    <>
      <ProfessionalsTable
        data={professionals}
        locale={locale}
        translations={{
          ...translations,
        }}
      />
    </>
  );
}
