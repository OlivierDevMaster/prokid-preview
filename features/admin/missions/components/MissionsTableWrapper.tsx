'use client';

import { useFindMissions } from '../hooks/useFindMissions';
import { MissionsTable } from './MissionsTable';

interface MissionsTableWrapperProps {
  locale: string;
  translations: {
    actions?: string;
    createdAt: string;
    endDate: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    professional: string;
    startDate: string;
    status: string;
    structure: string;
    titleColumn: string;
    view?: string;
  };
}

export function MissionsTableWrapper({
  locale,
  translations,
}: MissionsTableWrapperProps) {
  const { data, isLoading } = useFindMissions({}, { limit: 1000 });

  const missions = data?.data ?? [];

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>Loading...</p>;
  }

  if (missions.length === 0) {
    return (
      <p className='py-8 text-center text-gray-500'>{translations.noResults}</p>
    );
  }

  return (
    <>
      <MissionsTable
        data={missions}
        locale={locale}
        translations={translations}
      />
    </>
  );
}
