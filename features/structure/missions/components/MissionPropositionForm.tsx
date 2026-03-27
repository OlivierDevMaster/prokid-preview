'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { eachDayOfInterval, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  Home,
  MapPin,
  RefreshCw,
  Type,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { type Resolver, useForm } from 'react-hook-form';

import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldError } from '@/components/ui/field';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePickerInput } from '@/components/ui/input-date';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getOrCreateConversation } from '@/features/chat/services/conversation.service';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

import { useCreateMissionProposition } from '../hooks/useCreateMissionProposition';
import {
  getMissionPropositionSchema,
  type MissionPropositionFormValues,
} from '../validation/mission.schema';
import { RecapPropositionCard } from './RecapPropositionCard';

export function MissionPropositionForm() {
  const t = useTranslations('structure.missions.proposition');
  const router = useRouter();
  const { data: session } = useSession();
  const missionPropositionSchema = useMemo(
    () => getMissionPropositionSchema(t),
    [t]
  );
  const { selectedProfessionalIds } = useSelectedProfessional();
  const createMissionProposition = useCreateMissionProposition();
  const form = useForm<MissionPropositionFormValues>({
    defaultValues: {
      address: '',
      dailyEndTime: '17:00',
      dailyStartTime: '08:00',
      daySchedules: [],
      description: '',
      endDate: undefined,
      modality: 'on_site',
      professionalIds: [],
      sameHoursEveryDay: true,
      startDate: undefined,
      title: '',
    },
    mode: 'onChange',
    resolver: zodResolver(missionPropositionSchema) as unknown as Resolver<MissionPropositionFormValues>,
  });

  // Sync selected professional IDs from store
  React.useEffect(() => {
    const ids = Array.from(selectedProfessionalIds);
    form.setValue('professionalIds', ids);
    if (form.formState.isSubmitted || form.formState.isDirty) {
      void form.trigger('professionalIds');
    }
  }, [selectedProfessionalIds, form]);

  const handleSubmit = async (values: MissionPropositionFormValues) => {
    const missions = await createMissionProposition.mutateAsync(values);
    const structureId = session?.user?.id;

    if (missions.length > 1) {
      router.push('/structure/chat');
      return;
    }

    if (missions.length === 1 && structureId) {
      const conversation = await getOrCreateConversation({
        professional_id: missions[0].professional_id,
        structure_id: structureId,
      });
      router.push(`/structure/chat?conversationId=${conversation.id}`);
    } else if (missions.length === 1) {
      router.push('/structure/chat');
    }
  };

  const modality = form.watch('modality');
  const title = form.watch('title');
  const address = form.watch('address');
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const sameHoursEveryDay = form.watch('sameHoursEveryDay');
  const dailyStartTime = form.watch('dailyStartTime');
  const dailyEndTime = form.watch('dailyEndTime');
  const daySchedules = form.watch('daySchedules') || [];

  const showAddressInput = modality === 'on_site' || modality === 'hybrid';

  // Generate day list when date range changes and user wants per-day schedules
  const daysInRange = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return [];
    try {
      return eachDayOfInterval({ end: endDate, start: startDate }).slice(0, 31);
    } catch {
      return [];
    }
  }, [startDate, endDate]);

  // Update daySchedules when toggling or when date range changes
  const handleToggleSameHours = (checked: boolean) => {
    form.setValue('sameHoursEveryDay', checked);
    if (!checked && daysInRange.length > 0) {
      // Pre-fill each day with the current uniform times
      const schedules = daysInRange.map(date => ({
        date,
        endTime: dailyEndTime || '17:00',
        startTime: dailyStartTime || '08:00',
      }));
      form.setValue('daySchedules', schedules);
    }
  };

  // When date range changes and per-day mode is active, regenerate schedules
  React.useEffect(() => {
    if (!sameHoursEveryDay && daysInRange.length > 0) {
      const existing = form.getValues('daySchedules') || [];
      const schedules = daysInRange.map(date => {
        const existingDay = existing.find(
          d => d.date && format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        return {
          date,
          endTime: existingDay?.endTime || dailyEndTime || '17:00',
          startTime: existingDay?.startTime || dailyStartTime || '08:00',
        };
      });
      form.setValue('daySchedules', schedules);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysInRange.length, sameHoursEveryDay]);

  const TIME_INPUT_CLASS =
    'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className='mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row'>
          {/* Main form column */}
          <div className='flex-1 space-y-6'>
            {form.formState.errors.professionalIds?.message && (
              <p className='text-sm font-medium text-destructive' role='alert'>
                {form.formState.errors.professionalIds.message}
              </p>
            )}

            {/* 1. Titre */}
            <Card className='border-none bg-white shadow-sm'>
              <div className='px-4 pt-4 sm:px-6'>
                <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                    <Type className='h-4 w-4 text-blue-600' />
                  </span>
                  <span>1. {t('missionSectionTitle')}</span>
                </h2>
              </div>
              <div className='space-y-2 px-4 py-5'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className='sr-only'>
                        {t('missionSectionTitle')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className={cn(
                            'rounded-xl border bg-blue-50/40 text-sm placeholder:text-gray-400',
                            fieldState.error
                              ? 'border-destructive'
                              : 'border-blue-100'
                          )}
                          placeholder={t('missionSectionPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FieldError errors={[fieldState.error]} />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* 2. Description */}
            <Card className='border-none bg-white shadow-sm'>
              <div className='space-y-4 px-4 py-3 sm:px-6 sm:py-6'>
                <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                    <FileText className='h-4 w-4 text-blue-600' />
                  </span>
                  <span>2. {t('descriptionSectionTitle')}</span>
                </h2>
                <p className='mt-1 text-sm font-medium text-gray-500'>
                  {t('descriptionHelper')}
                </p>
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className='sr-only'>
                        {t('descriptionSectionTitle')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className={cn(
                            'min-h-[180px] resize-y rounded-2xl border bg-blue-50/40 text-sm placeholder:text-gray-400',
                            fieldState.error
                              ? 'border-destructive'
                              : 'border-blue-100'
                          )}
                          placeholder={t('descriptionPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FieldError errors={[fieldState.error]} />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* 3. Période et horaires */}
            <Card className='border-none bg-white shadow-sm'>
              <div className='px-4 pb-3 pt-4 sm:px-6'>
                <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                    <CalendarDays className='h-4 w-4 text-blue-600' />
                  </span>
                  <span>3. {t('scheduleSectionTitle')}</span>
                </h2>
                <p className='mt-4 text-sm font-medium text-gray-500'>
                  {t('scheduleHelper')}
                </p>
              </div>

              <div className='space-y-5 px-4 pb-5 sm:px-6'>
                {/* Date range */}
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium text-gray-700'>
                      {t('startDateLabel')}
                    </Label>
                    <FormField
                      control={form.control}
                      name='startDate'
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <DatePickerInput
                              hasError={Boolean(fieldState.error)}
                              inputGroupClassName={cn(
                                'rounded-xl bg-blue-50/40',
                                !fieldState.error && 'border-blue-100'
                              )}
                              onChange={(date: Date | undefined) => {
                                field.onChange(date ?? undefined);
                                // If end date not set or before new start, sync it
                                const currentEnd = form.getValues('endDate');
                                if (date && (!currentEnd || currentEnd < date)) {
                                  form.setValue('endDate', date);
                                }
                              }}
                              value={field.value}
                            />
                          </FormControl>
                          <FieldError errors={[fieldState.error]} />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-medium text-gray-700'>
                      {t('endDateLabel')}
                    </Label>
                    <FormField
                      control={form.control}
                      name='endDate'
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <DatePickerInput
                              hasError={Boolean(fieldState.error)}
                              inputGroupClassName={cn(
                                'rounded-xl bg-blue-50/40',
                                !fieldState.error && 'border-blue-100'
                              )}
                              onChange={(date: Date | undefined) => {
                                field.onChange(date ?? undefined);
                              }}
                              value={field.value}
                            />
                          </FormControl>
                          <FieldError errors={[fieldState.error]} />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Time slots section */}
                <div className='space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4'>
                  <div className='flex items-center gap-3'>
                    <Clock3 className='h-4 w-4 text-blue-600' />
                    <h3 className='text-sm font-semibold text-slate-800'>
                      {t('scheduleTimeTitle')}
                    </h3>
                  </div>

                  {/* Same hours checkbox */}
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      checked={sameHoursEveryDay}
                      id='sameHours'
                      onCheckedChange={(checked) => handleToggleSameHours(!!checked)}
                    />
                    <Label
                      className='cursor-pointer text-sm text-slate-700'
                      htmlFor='sameHours'
                    >
                      {t('sameHoursEveryDay')}
                    </Label>
                  </div>

                  {sameHoursEveryDay ? (
                    /* Uniform times */
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1.5'>
                        <Label className='text-xs font-medium text-gray-600'>
                          {t('startTimeLabel')}
                        </Label>
                        <FormField
                          control={form.control}
                          name='dailyStartTime'
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <input
                                  className={cn(
                                    TIME_INPUT_CLASS,
                                    fieldState.error && 'border-destructive'
                                  )}
                                  onChange={field.onChange}
                                  type='time'
                                  value={field.value}
                                />
                              </FormControl>
                              <FieldError errors={[fieldState.error]} />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className='space-y-1.5'>
                        <Label className='text-xs font-medium text-gray-600'>
                          {t('endTimeLabel')}
                        </Label>
                        <FormField
                          control={form.control}
                          name='dailyEndTime'
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <input
                                  className={cn(
                                    TIME_INPUT_CLASS,
                                    fieldState.error && 'border-destructive'
                                  )}
                                  onChange={field.onChange}
                                  type='time'
                                  value={field.value}
                                />
                              </FormControl>
                              <FieldError errors={[fieldState.error]} />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Per-day schedules */
                    <div className='space-y-2'>
                      {daysInRange.length === 0 ? (
                        <p className='py-3 text-center text-sm text-slate-400'>
                          {t('selectDatesFirst')}
                        </p>
                      ) : (
                        <div className='max-h-[300px] space-y-2 overflow-y-auto pr-1'>
                          {daysInRange.map((day, index) => (
                            <div
                              className='flex items-center gap-3 rounded-lg bg-white p-2.5'
                              key={format(day, 'yyyy-MM-dd')}
                            >
                              <span className='w-24 shrink-0 text-sm font-medium text-slate-700'>
                                {format(day, 'EEE dd/MM', { locale: fr })}
                              </span>
                              <input
                                className={TIME_INPUT_CLASS}
                                onChange={e => {
                                  const updated = [...daySchedules];
                                  if (updated[index]) {
                                    updated[index] = {
                                      ...updated[index],
                                      startTime: e.target.value,
                                    };
                                    form.setValue('daySchedules', updated);
                                  }
                                }}
                                type='time'
                                value={daySchedules[index]?.startTime || '08:00'}
                              />
                              <span className='text-sm text-slate-400'>→</span>
                              <input
                                className={TIME_INPUT_CLASS}
                                onChange={e => {
                                  const updated = [...daySchedules];
                                  if (updated[index]) {
                                    updated[index] = {
                                      ...updated[index],
                                      endTime: e.target.value,
                                    };
                                    form.setValue('daySchedules', updated);
                                  }
                                }}
                                type='time'
                                value={daySchedules[index]?.endTime || '17:00'}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* 4. Modalité */}
            <Card className='border-none bg-white shadow-sm'>
              <div className='px-4 pb-3 pt-4 sm:px-6'>
                <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                    <MapPin className='h-4 w-4 text-blue-600' />
                  </span>
                  <span>4. {t('locationSectionTitle')}</span>
                </h2>
              </div>

              <div className='space-y-4 px-4 py-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <FormField
                    control={form.control}
                    name='modality'
                    render={({ field }) => (
                      <FormItem className='flex flex-wrap gap-3'>
                        <FormControl>
                          <div className='flex flex-wrap gap-3'>
                            <button
                              className={cn(
                                'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition',
                                field.value === 'on_site'
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-600'
                              )}
                              onClick={() => field.onChange('on_site')}
                              type='button'
                            >
                              <Building2 className='h-4 w-4' />
                              {t('modalityOnSite')}
                            </button>
                            <button
                              className={cn(
                                'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition',
                                field.value === 'remote'
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-600'
                              )}
                              onClick={() => field.onChange('remote')}
                              type='button'
                            >
                              <Home className='h-4 w-4' />
                              {t('modalityRemote')}
                            </button>
                            <button
                              className={cn(
                                'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition',
                                field.value === 'hybrid'
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-600'
                              )}
                              onClick={() => field.onChange('hybrid')}
                              type='button'
                            >
                              <RefreshCw className='h-4 w-4' />
                              {t('modalityHybrid')}
                            </button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {showAddressInput && (
                  <div className='space-y-2'>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      {t('missionAddressLabel')}
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name='address'
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <div className='relative'>
                              <MapPin className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                              <Input
                                className={cn(
                                  'rounded-xl border bg-blue-50/40 pl-10 text-sm placeholder:text-gray-400',
                                  fieldState.error
                                    ? 'border-destructive'
                                    : 'border-blue-100'
                                )}
                                placeholder={t('addressPlaceholder')}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FieldError errors={[fieldState.error]} />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Recap */}
          <div className='w-full max-w-sm space-y-4 lg:sticky lg:top-6 lg:self-start'>
            <RecapPropositionCard
              address={address ?? ''}
              dailyEndTime={dailyEndTime}
              dailyStartTime={dailyStartTime}
              daySchedules={daySchedules}
              endDate={endDate}
              errorMessage={
                createMissionProposition.error instanceof Error
                  ? createMissionProposition.error.message
                  : createMissionProposition.error
                    ? String(createMissionProposition.error)
                    : null
              }
              isSubmitting={createMissionProposition.isPending}
              modality={modality}
              sameHoursEveryDay={sameHoursEveryDay}
              startDate={startDate}
              title={title}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
