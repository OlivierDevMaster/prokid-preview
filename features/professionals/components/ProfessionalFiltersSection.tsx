'use client';

import { addDays, format, parseISO } from 'date-fns';
import { CalendarDays, Search, SlidersHorizontal, User, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProfessionalActiveFilters } from '@/features/professionals/components/filters/ProfessionalActiveFilters';
import { ProfessionalAvailabilitySelect } from '@/features/professionals/components/filters/ProfessionalAvailabilitySelect';
import { ProfessionalLocationInput } from '@/features/professionals/components/filters/ProfessionalLocationInput';
import { ProfessionalRoleSelect } from '@/features/professionals/components/filters/ProfessionalRoleSelect';
import { StructureLocationActivation } from '@/features/professionals/components/filters/StructureLocationActivation';

import {
  ProfessionalSearchActions,
  ProfessionalSearchState,
} from '../hooks/useProfessionalSearch';

interface ProfessionalFiltersSectionProps {
  actions: ProfessionalSearchActions;
  hasResults: boolean;
  resultsCount?: number;
  showStructureLocationActivation?: boolean;
  state: ProfessionalSearchState;
}

export function ProfessionalFiltersSection({
  actions,
  hasResults,
  resultsCount,
  showStructureLocationActivation = false,
  state,
}: ProfessionalFiltersSectionProps) {
  const t = useTranslations('professional');
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);

  const hasAvailabilityDate = state.selectedAvailabilityDate.length > 0;
  const hasAvailabilityFilter = state.selectedAvailability !== 'all';

  const availabilityStartDate = hasAvailabilityDate
    ? parseISO(state.selectedAvailabilityDate)
    : null;
  const availabilityEndDate =
    availabilityStartDate &&
    typeof state.selectedAvailabilityDurationDays === 'number' &&
    state.selectedAvailabilityDurationDays > 0
      ? addDays(
          availabilityStartDate,
          state.selectedAvailabilityDurationDays - 1
        )
      : null;

  const availabilitySummary =
    hasAvailabilityFilter && availabilityStartDate
      ? typeof state.selectedAvailabilityDurationDays === 'number' &&
        availabilityEndDate
        ? `${format(availabilityStartDate, 'dd/MM/yyyy')} - ${format(availabilityEndDate, 'dd/MM/yyyy')} (${state.selectedAvailabilityDurationDays} ${state.selectedAvailabilityDurationDays > 1 ? t('search.dayPlural') : t('search.daySingular')})`
        : `${format(availabilityStartDate, 'dd/MM/yyyy')}`
      : null;

  const sheetFilterCount =
    (state.selectedRole !== 'all' ? 1 : 0) +
    (state.selectedAvailability !== 'all' ? 1 : 0);

  const handleSheetReset = () => {
    actions.clearAvailabilityFilter();
    actions.clearRoleFilter();
  };

  const handleSheetApply = () => {
    actions.applyFilters();
    setFiltersSheetOpen(false);
  };

  const mobileSearchCtaLabel =
    typeof resultsCount === 'number'
      ? t('search.showResultsCount', { count: resultsCount })
      : t('search.searchButton');

  return (
    <div className='border-b border-slate-200 bg-white px-4 py-6 sm:px-6 md:px-10 md:py-8'>
      <div className='mx-auto max-w-7xl'>
        {/* Mobile: primary fields + filters sheet + CTA */}
        <div className='flex flex-col gap-3 md:hidden'>
          <div>
            <label
              className='mb-1.5 block text-xs font-semibold text-slate-600'
              htmlFor='professional-search-query-mobile'
            >
              {t('search.searchProfessionLabel')}
            </label>
            <div className='relative flex min-h-11 items-center rounded-xl border border-slate-200 bg-white shadow-sm'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <input
                className='h-11 min-w-0 flex-1 border-none bg-transparent pl-9 pr-10 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400'
                id='professional-search-query-mobile'
                onChange={e => actions.setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                type='search'
                value={state.searchQuery}
              />
              {state.searchQuery.length > 0 && (
                <button
                  aria-label={t('search.clear')}
                  className='absolute right-2 top-1/2 flex h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  onClick={() => actions.setSearchQuery('')}
                  type='button'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className='mb-1.5 block text-xs font-semibold text-slate-600'>
              {t('search.whereLabel')}
            </label>
            <div className='rounded-xl border border-slate-200 bg-white shadow-sm'>
              <ProfessionalLocationInput
                onChange={(value, coords) => {
                  actions.setLocationQuery(value);
                  actions.applyLocationFilter(value, coords);
                }}
                value={state.locationQuery}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <Sheet onOpenChange={setFiltersSheetOpen} open={filtersSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  className='relative h-11 min-h-11 w-full justify-center gap-2 rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
                  type='button'
                  variant='outline'
                >
                  <SlidersHorizontal className='h-4 w-4 shrink-0' />
                  <span className='truncate'>{t('label.filters')}</span>
                  {sheetFilterCount > 0 && (
                    <Badge
                      className='ml-0.5 h-5 min-w-5 justify-center px-1.5 text-[11px]'
                      variant='secondary'
                    >
                      {sheetFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                className='flex max-h-[min(90dvh,720px)] flex-col gap-0 overflow-hidden rounded-t-2xl border-slate-200 p-0 pb-[max(1rem,env(safe-area-inset-bottom))]'
                onInteractOutside={event => {
                  if (isRadixPortaledLayerTarget(event.target)) {
                    event.preventDefault();
                  }
                }}
                onPointerDownOutside={event => {
                  if (isRadixPortaledLayerTarget(event.target)) {
                    event.preventDefault();
                  }
                }}
                side='bottom'
              >
                <SheetHeader className='border-b border-slate-100 px-6 pb-4 pt-2 text-left'>
                  <SheetTitle className='text-lg font-semibold'>
                    {t('label.filters')}
                  </SheetTitle>
                </SheetHeader>

                <div className='flex-1 space-y-6 overflow-y-auto px-6 py-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-semibold text-slate-800'>
                      <CalendarDays
                        aria-hidden
                        className='h-5 w-5 shrink-0 text-[#4A90E2]'
                      />
                      {t('search.availability')}
                    </div>
                    <ProfessionalAvailabilitySelect
                      onDateChange={actions.setSelectedAvailabilityDate}
                      onDurationDaysChange={
                        actions.setSelectedAvailabilityDurationDays
                      }
                      onOpenChange={actions.setIsAvailabilitySelectOpen}
                      onValueChange={actions.setSelectedAvailability}
                      open={state.isAvailabilitySelectOpen}
                      selectedDate={state.selectedAvailabilityDate}
                      selectedDurationDays={
                        state.selectedAvailabilityDurationDays
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm font-semibold text-slate-800'>
                      <User
                        aria-hidden
                        className='h-5 w-5 shrink-0 text-[#4A90E2]'
                      />
                      {t('search.role')}
                    </div>
                    <div className='w-full [&_button]:w-full'>
                      <ProfessionalRoleSelect
                        onOpenChange={actions.setIsRoleSelectOpen}
                        onValueChange={actions.setSelectedRole}
                        open={state.isRoleSelectOpen}
                        value={state.selectedRole}
                      />
                    </div>
                  </div>
                </div>

                <SheetFooter className='mt-auto gap-2 border-t border-slate-100 p-4 sm:flex-row'>
                  <Button
                    className='h-11 flex-1 rounded-xl'
                    onClick={handleSheetReset}
                    type='button'
                    variant='outline'
                  >
                    {t('search.filtersSheetReset')}
                  </Button>
                  <Button
                    className='h-11 flex-1 rounded-xl bg-[#4A90E2] text-white hover:opacity-90'
                    onClick={handleSheetApply}
                    type='button'
                  >
                    {t('search.filtersSheetApply')}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Button
              className='flex h-11 min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4A90E2] px-3 text-sm font-semibold text-white shadow-sm hover:opacity-90'
              onClick={actions.applyFilters}
              type='button'
            >
              <Search className='h-4 w-4 shrink-0' />
              <span className='truncate'>{mobileSearchCtaLabel}</span>
            </Button>
          </div>
        </div>

        {/* Desktop: merged bar + inline filters */}
        <div className='hidden items-center gap-3 md:flex'>
          <div className='flex flex-1 items-center rounded-xl border border-slate-200 bg-white shadow-sm'>
            <Search className='ml-4 h-4 w-4 flex-shrink-0 text-slate-400' />
            <input
              className='h-11 min-w-0 flex-[2] border-none bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400'
              onChange={e => actions.setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              type='text'
              value={state.searchQuery}
            />
            <div className='h-6 w-px bg-slate-200' />
            <div className='flex-1'>
              <ProfessionalLocationInput
                onChange={(value, coords) => {
                  actions.setLocationQuery(value);
                  actions.applyLocationFilter(value, coords);
                }}
                value={state.locationQuery}
              />
            </div>
          </div>

          <ProfessionalAvailabilitySelect
            onDateChange={actions.setSelectedAvailabilityDate}
            onDurationDaysChange={actions.setSelectedAvailabilityDurationDays}
            onOpenChange={actions.setIsAvailabilitySelectOpen}
            onValueChange={actions.setSelectedAvailability}
            open={state.isAvailabilitySelectOpen}
            selectedDate={state.selectedAvailabilityDate}
            selectedDurationDays={state.selectedAvailabilityDurationDays}
          />
          <ProfessionalRoleSelect
            onOpenChange={actions.setIsRoleSelectOpen}
            onValueChange={actions.setSelectedRole}
            open={state.isRoleSelectOpen}
            value={state.selectedRole}
          />
          <Button
            className='flex h-11 min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[#4A90E2] px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90'
            onClick={actions.applyFilters}
            type='button'
          >
            <Search className='h-4 w-4' />
            <span>{t('search.searchButton')}</span>
          </Button>
        </div>
      </div>

      {(availabilitySummary || showStructureLocationActivation) && (
        <div className='mx-auto mt-3 max-w-7xl'>
          {availabilitySummary && (
            <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs text-blue-700'>
              <span>{availabilitySummary}</span>
              <button
                aria-label={t('search.clear')}
                className='rounded-full p-0.5 hover:bg-blue-100'
                onClick={actions.clearAvailabilityFilter}
                type='button'
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          )}
          {showStructureLocationActivation && <StructureLocationActivation />}
        </div>
      )}

      <div className='mx-auto max-w-7xl'>
        <ProfessionalActiveFilters
          collapsibleOnMobile
          hasResults={hasResults}
          locationQuery={state.appliedLocationQuery}
          onClearAll={actions.handleClearAllFilters}
          onClearAvailability={actions.clearAvailabilityFilter}
          onClearLocation={actions.clearLocationFilter}
          onClearRole={actions.clearRoleFilter}
          onClearSearch={() => actions.setSearchQuery('')}
          searchQuery={state.searchQuery}
          selectedAvailability={state.appliedAvailability}
          selectedRole={state.appliedRole}
        />
      </div>
    </div>
  );
}

function isRadixPortaledLayerTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(
    target.closest('[data-radix-popper-content-wrapper]') ||
    target.closest('[data-radix-dropdown-menu-content]')
  );
}
