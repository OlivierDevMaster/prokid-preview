'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/features/paginations/components/Pagination';
import { ProfessionalFiltersSection } from '@/features/professionals/components/ProfessionalFiltersSection';
import { ProfessionalSearchCard } from '@/features/professionals/components/ProfessionalSearchCard';
import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { useProfessionalSearch } from '@/features/professionals/hooks/useProfessionalSearch';
import { ProfessionalConfig } from '@/features/professionals/professional.config';
import { Professional } from '@/features/professionals/professional.model';
import { useRouter } from '@/i18n/routing';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

export default function StructureSearchPage() {
  const { handleToggleProfessional, selectedProfessionalIds } =
    useSelectedProfessional();
  const t = useTranslations('professional');
  const tMissions = useTranslations('structure.missions');
  const router = useRouter();
  const { actions, state } = useProfessionalSearch();

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_SIZE_DEFAULT)
  );

  const { data } = useFindProfessionals(
    {
      availability: state.selectedAvailability,
      current_job:
        state.selectedRole === 'all' ? undefined : state.selectedRole,
      locationSearch: state.locationQuery,
      search: state.searchQuery,
    },
    { limit: pageSize, page }
  );

  const professionals: Professional[] = useMemo(() => data?.data ?? [], [data]);
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const resultsCount = totalCount;

  const selectedProfessionalsForAvatars = useMemo(
    () =>
      professionals
        .filter(p => selectedProfessionalIds.has(p.user_id))
        .slice(0, 3),
    [professionals, selectedProfessionalIds]
  );
  const remainingSelectedCount =
    selectedProfessionalIds.size > 3 ? selectedProfessionalIds.size - 3 : 0;

  const handleSendMission = () => {
    if (selectedProfessionalIds.size === 0) {
      return;
    }
    const professionalIds = Array.from(selectedProfessionalIds);
    router.push(
      `/structure/missions/new?professional_ids=${professionalIds.join(',')}`
    );
  };

  return (
    <main className='min-h-screen bg-gray-100 pb-4'>
      <div className='mx-auto max-w-7xl space-y-4 sm:space-y-6'>
        <ProfessionalFiltersSection actions={actions} state={state} />
        <div className='mx-4 mb-2 sm:mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>
            <span className='font-semibold'>{resultsCount}</span>{' '}
            {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
          </h2>
          <p className='text-sm text-gray-400'>
            {t('results.foundDescription')}
          </p>
        </div>
        <div className='mx-4 mt-4 grid max-w-7xl grid-cols-1 gap-4 sm:mt-6 md:grid-cols-2 xl:grid-cols-3'>
          {professionals.map((professional: Professional) => (
            <ProfessionalSearchCard
              key={professional.user_id}
              onToggleSelect={professional =>
                handleToggleProfessional(professional.user_id)
              }
              professional={professional}
              selectable
              selected={selectedProfessionalIds.has(professional.user_id)}
            />
          ))}
        </div>
        {totalCount > 0 && (
          <div className='mt-8 flex justify-center'>
            <Pagination
              currentPage={page}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSize={pageSize}
              totalItems={totalCount}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>

      {selectedProfessionalIds.size > 0 && (
        <div className='fixed bottom-4 right-8 z-50 flex justify-end'>
          <div className='flex items-center gap-4 rounded-full border border-gray-200 bg-white py-3 pl-4 pr-3 shadow-lg'>
            <div className='flex items-center'>
              {selectedProfessionalsForAvatars.map((professional, index) => {
                const fullName = [
                  professional.profile.first_name,
                  professional.profile.last_name,
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <div
                    className='-ml-2 first:ml-0'
                    key={professional.user_id}
                    style={{ zIndex: 3 - index }}
                  >
                    <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-200'>
                      {professional.profile.avatar_url ? (
                        <Image
                          alt={fullName || 'Professional'}
                          className='h-full w-full object-cover'
                          height={36}
                          src={professional.profile.avatar_url}
                          unoptimized
                          width={36}
                        />
                      ) : (
                        <span className='text-sm font-semibold text-gray-500'>
                          {professional.profile.first_name?.charAt(0) ?? '?'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {remainingSelectedCount > 0 && (
                <div
                  className='-ml-2 flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border-2 border-white bg-gray-100 px-1.5 text-xs font-medium text-gray-600'
                  style={{ zIndex: 0 }}
                >
                  {tMissions('othersCount', { count: remainingSelectedCount })}
                </div>
              )}
            </div>
            <p className='text-xs font-medium sm:text-base'>
              {selectedProfessionalIds.size}{' '}
              {selectedProfessionalIds.size === 1
                ? tMissions('selected')
                : tMissions('selectedPlural')}
            </p>
            <Button
              className='flex items-center gap-3 rounded-full px-6 py-6 text-sm font-semibold text-white shadow-md hover:bg-blue-700 sm:text-base'
              onClick={handleSendMission}
            >
              <Send className='h-4 w-4' />
              <span>{tMissions('sendMission')}</span>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
