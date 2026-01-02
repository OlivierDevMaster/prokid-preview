'use client';

import { parseAsInteger, useQueryState } from 'nuqs';

import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { ProfessionalConfig } from '@/features/professionals/professional.config';

import { ProfessionalsTable } from './ProfessionalsTable';

interface ProfessionalsTableWrapperProps {
  locale: string;
  translations: {
    actions?: string;
    city: string;
    createdAt: string;
    currentJob: string;
    delete?: string;
    edit?: string;
    email: string;
    name: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    view?: string;
  };
}

export function ProfessionalsTableWrapper({
  locale,
  translations,
}: ProfessionalsTableWrapperProps) {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_SIZE_DEFAULT)
  );

  const { data, isLoading } = useFindProfessionals(
    {},
    { limit: pageSize, page }
  );

  const professionals = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>Loading...</p>;
  }

  if (professionals.length === 0) {
    return (
      <p className='py-8 text-center text-gray-500'>{translations.noResults}</p>
    );
  }

  return (
    <>
      <ProfessionalsTable
        currentPage={page}
        data={professionals}
        locale={locale}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        translations={{
          ...translations,
        }}
      />
    </>
  );
}
