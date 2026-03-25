'use client';

import { Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { ProfessionalFiltersSection } from '@/features/professionals/components/ProfessionalFiltersSection';
import { ProfessionalSearchResultsSection } from '@/features/professionals/components/ProfessionalSearchResultsSection';
import { useFindNearbyProfessionalsFromStructure } from '@/features/professionals/hooks/useFindNearbyProfessionalsFromStructure';
import { useProfessionalSearch } from '@/features/professionals/hooks/useProfessionalSearch';
import { ProfessionalConfig } from '@/features/professionals/professional.config';
import { ProfessionalWithDistance } from '@/features/professionals/types/nearby-professionals.types';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

export default function StructureSearchPage() {
  const { handleToggleProfessional, selectedProfessionalIds } =
    useSelectedProfessional();
  const { data: session } = useSession();
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

  const structureId = session?.user?.id;

  const { data } = useFindNearbyProfessionalsFromStructure(
    structureId,
    {
      availability: state.appliedAvailability,
      current_job: state.appliedRole === 'all' ? undefined : state.appliedRole,
      locationCoords: state.appliedLocationCoords ?? undefined,
      locationSearch: state.appliedLocationQuery,
      search: state.searchQuery,
    },
    { limit: pageSize, page, radiusKm: 10 }
  );

  const professionals: ProfessionalWithDistance[] = useMemo(
    () => data?.data ?? [],
    [data]
  );
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

  const hasResults = totalCount > 0;

  const handleResetFilters = () => {
    actions.handleClearAllFilters();
    setPage(ProfessionalConfig.PAGE_DEFAULT);
  };

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
      <ProfessionalFiltersSection
        actions={actions}
        hasResults={hasResults}
        resultsCount={resultsCount}
        showStructureLocationActivation
        state={state}
      />
      <div className='mx-auto max-w-7xl space-y-4 sm:space-y-6 sm:px-6 lg:px-8'>
        <ProfessionalSearchResultsSection
          hasResults={hasResults}
          isSelected={professionalId =>
            selectedProfessionalIds.has(professionalId)
          }
          locationFallback={data?.locationFallback}
          locationQuery={data?.locationQuery}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onResetFilters={handleResetFilters}
          onToggleSelect={professionalId =>
            handleToggleProfessional(professionalId)
          }
          page={page}
          pageSize={pageSize}
          professionals={professionals}
          resultsCount={resultsCount}
          totalCount={totalCount}
          totalPages={totalPages}
        />
      </div>

      {selectedProfessionalIds.size > 0 && hasResults && (
        <div className='fixed bottom-4 left-4 right-4 z-50 flex justify-end md:left-auto md:right-8'>
          <div
            className={cn(
              'flex w-full min-w-0 max-w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white py-3 pl-4 pr-3 shadow-lg',
              'md:w-auto md:max-w-none md:flex-row md:items-center md:gap-4 md:rounded-full'
            )}
          >
            <div className='flex min-w-0 flex-1 items-center gap-3 md:gap-4'>
              <div className='flex min-w-0 flex-1 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                <div className='flex shrink-0 items-center'>
                  {selectedProfessionalsForAvatars.map(
                    (professional, index) => {
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
                                {professional.profile.first_name?.charAt(0) ??
                                  '?'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                  {remainingSelectedCount > 0 && (
                    <div
                      className='-ml-2 flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-100 px-1.5 text-xs font-medium text-gray-600'
                      style={{ zIndex: 0 }}
                    >
                      {tMissions('othersCount', {
                        count: remainingSelectedCount,
                      })}
                    </div>
                  )}
                </div>
              </div>
              <p className='shrink-0 text-xs font-medium sm:text-base'>
                {selectedProfessionalIds.size}{' '}
                {selectedProfessionalIds.size === 1
                  ? tMissions('selected')
                  : tMissions('selectedPlural')}
              </p>
            </div>
            <Button
              className='flex w-full shrink-0 items-center justify-center gap-3 rounded-full px-6 py-6 text-sm font-semibold text-white shadow-md hover:bg-blue-700 sm:text-base md:w-auto'
              onClick={handleSendMission}
            >
              <Send className='h-4 w-4 shrink-0' />
              <span className='truncate'>{tMissions('sendMission')}</span>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
