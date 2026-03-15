'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  CalendarDays,
  Clock3,
  FileText,
  Info,
  MapPin,
  Type,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Card } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { getOrCreateConversation } from '@/features/chat/services/conversation.service';
import { useRouter } from '@/i18n/routing';
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
      description: '',
      durationDays: '',
      durationMode: 'duration',
      periodEndDate: undefined,
      periodStartDate: undefined,
      professionalIds: [],
      title: '',
    },
    mode: 'onChange',
    resolver: zodResolver(missionPropositionSchema),
  });

  // Sync selected professional IDs from store into form and revalidate when user has interacted
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
        mission_id: missions[0].id,
        professional_id: missions[0].professional_id,
        structure_id: structureId,
      });
      router.push(`/structure/chat?conversationId=${conversation.id}`);
    } else if (missions.length === 1) {
      router.push('/structure/chat');
    }
  };

  const durationMode = form.watch('durationMode');
  const title = form.watch('title');
  const durationDays = form.watch('durationDays') ?? '';
  const address = form.watch('address');
  const desiredStartDate = form.watch('desiredStartDate');
  const periodStartDate = form.watch('periodStartDate');
  const periodEndDate = form.watch('periodEndDate');

  const selectDuration = () => {
    form.setValue('durationMode', 'duration');
    form.setValue('desiredStartDate', undefined);
    form.setValue('periodStartDate', undefined);
    form.setValue('periodEndDate', undefined);
  };

  const selectPeriod = () => {
    form.setValue('durationMode', 'period');
    form.setValue('desiredStartDate', undefined);
    form.setValue('periodStartDate', undefined);
    form.setValue('periodEndDate', undefined);
  };

  return (
    <Form {...form}>
      <form
        // className='p-4 sm:p-6 lg:p-8'
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className='mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row'>
          {/* Main form column */}
          <div className='flex-1 space-y-6'>
            {form.formState.errors.professionalIds?.message && (
              <p className='text-sm font-medium text-destructive' role='alert'>
                {form.formState.errors.professionalIds.message}
              </p>
            )}
            {/* 1. Titre de la mission */}
            <Card className='border-none bg-white shadow-sm'>
              <div className='px-4 py-3 sm:px-6'>
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
                          className={`rounded-xl border bg-blue-50/40 text-sm placeholder:text-gray-400 ${
                            fieldState.error
                              ? 'border-destructive'
                              : 'border-blue-100'
                          }`}
                          id='mission-title'
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

            {/* 2. Description / Contexte */}
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
                          className={`min-h-[180px] resize-y rounded-2xl border bg-blue-50/40 text-sm placeholder:text-gray-400 ${
                            fieldState.error
                              ? 'border-destructive'
                              : 'border-blue-100'
                          }`}
                          id='mission-description'
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

            {/* 2. Durée / Période */}
            <Card className='border-none bg-white shadow-sm'>
              <div className='px-4 py-3 sm:px-6'>
                <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                    <Clock3 className='h-4 w-4 text-blue-600' />
                  </span>
                  <span>3. {t('durationSectionTitle')}</span>
                </h2>
                <p className='mt-4 text-sm font-medium text-gray-500 sm:text-sm'>
                  {t('durationHelper')}
                </p>
              </div>

              <div className='space-y-4 px-4 pb-4 pt-2 sm:px-6 sm:pb-6'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='inline-flex rounded-full bg-gray-100 p-1 text-sm font-medium text-gray-600'>
                    <button
                      className={`rounded-full px-5 py-2 transition ${
                        durationMode === 'duration'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-gray-600'
                      }`}
                      onClick={selectDuration}
                      type='button'
                    >
                      {t('durationTab')}
                    </button>
                    <button
                      className={`rounded-full px-5 py-2 transition ${
                        durationMode === 'period'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-gray-600'
                      }`}
                      onClick={selectPeriod}
                      type='button'
                    >
                      {t('periodTab')}
                    </button>
                  </div>
                </div>

                {durationMode === 'duration' ? (
                  <div className='space-y-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 sm:p-4'>
                    <div className='flex items-center gap-2 text-blue-600'>
                      <Info className='h-3.5 w-3.5' />
                      <p className='text-xs'>{t('durationInfo')}</p>
                    </div>
                    <div className='mt-2 grid grid-cols-[minmax(0,1fr),auto] items-end gap-3'>
                      <div className='flex space-x-2'>
                        <FormField
                          control={form.control}
                          name='durationDays'
                          render={({ field, fieldState }) => (
                            <FormItem className='w-full max-w-[140px]'>
                              <FormLabel className='sr-only'>
                                {t('recapFieldDuration')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm shadow-sm placeholder:text-gray-400 ${
                                    fieldState.error
                                      ? 'border-destructive'
                                      : 'border-blue-100'
                                  }`}
                                  id='mission-duration'
                                  min={1}
                                  placeholder='10'
                                  type='number'
                                  {...field}
                                />
                              </FormControl>
                              <FieldError errors={[fieldState.error]} />
                            </FormItem>
                          )}
                        />
                        <div className='rounded-xl bg-gray-100 px-4 py-3 text-xs font-medium text-gray-900'>
                          {t('durationUnitDays')}
                        </div>
                      </div>
                      <div className='space-y-1.5'></div>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-2 rounded-lg border border-dashed border-gray-200 p-3'>
                    <div className='flex items-center gap-2 text-blue-600'>
                      <Info className='h-3.5 w-3.5' />
                      <p className='text-xs'>{t('periodInfo')}</p>
                    </div>
                    <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                      <div className='space-y-1.5'>
                        <FormLabel
                          className='text-xs font-medium text-gray-700'
                          htmlFor='period-start'
                        >
                          {t('periodStartLabel')}
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name='periodStartDate'
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <DatePickerInput
                                  hasError={Boolean(fieldState.error)}
                                  id='period-start'
                                  inputGroupClassName={`rounded-xl bg-blue-50/40 ${
                                    fieldState.error ? '' : 'border-blue-100'
                                  }`}
                                  onChange={(date: Date | undefined) => {
                                    field.onChange(date ?? undefined);
                                    form.setValue(
                                      'desiredStartDate',
                                      date ?? undefined
                                    );
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
                        <FormLabel
                          className='text-xs font-medium text-gray-700'
                          htmlFor='period-end'
                        >
                          {t('periodEndLabel')}
                        </FormLabel>
                        <FormField
                          control={form.control}
                          name='periodEndDate'
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormControl>
                                <DatePickerInput
                                  hasError={Boolean(fieldState.error)}
                                  id='period-end'
                                  inputGroupClassName={`rounded-xl bg-blue-50/40 ${
                                    fieldState.error ? '' : 'border-blue-100'
                                  }`}
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
                  </div>
                )}
              </div>
            </Card>

            {/* 3. Localisation / Modalités */}
            <Card className='border-none bg-white shadow-sm'>
              <div className='px-4 py-3 sm:px-6'>
                <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                    <MapPin className='h-4 w-4 text-blue-600' />
                  </span>
                  <span>4. {t('locationSectionTitle')}</span>
                </h2>
              </div>

              <div className='space-y-3 px-4 py-4'>
                <p className='text-sm font-medium text-gray-500'>
                  {t('locationHelper')}
                </p>
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className='sr-only'>
                        {t('locationSectionTitle')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className={`rounded-xl border bg-blue-50/40 text-sm placeholder:text-gray-400 ${
                            fieldState.error
                              ? 'border-destructive'
                              : 'border-blue-100'
                          }`}
                          id='mission-address'
                          placeholder={t('addressPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FieldError errors={[fieldState.error]} />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className='w-full max-w-sm space-y-4 lg:sticky lg:top-6 lg:self-start'>
            {/* 4. Début souhaité */}
            <Card className='border-none bg-white shadow-sm'>
              <div className='px-4 py-3 sm:px-6'>
                <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                    <CalendarDays className='h-4 w-4 text-blue-600' />
                  </span>
                  <span>5. {t('desiredStartSectionTitle')}</span>
                </h2>
              </div>
              <div className='px-4 py-2 sm:px-6 sm:py-5'>
                <div className='space-y-1.5'>
                  <FormField
                    control={form.control}
                    name='desiredStartDate'
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel
                          className='text-sm font-medium text-gray-500'
                          htmlFor='desired-start-date'
                        >
                          {t('desiredStartLabel')}
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            {durationMode === 'period' ? (
                              <Input
                                className={`w-full rounded-xl border bg-blue-50/40 pl-4 pr-9 text-sm placeholder:text-gray-400 ${
                                  fieldState.error
                                    ? 'border-destructive'
                                    : 'border-blue-100'
                                }`}
                                id='desired-start-date'
                                readOnly
                                value={
                                  field.value
                                    ? format(field.value, 'dd/MM/yyyy')
                                    : ''
                                }
                              />
                            ) : (
                              <DatePickerInput
                                fullWidth
                                hasError={Boolean(fieldState.error)}
                                id='desired-start-date'
                                inputGroupClassName={`rounded-xl bg-blue-50/40 ${
                                  fieldState.error ? '' : 'border-blue-100'
                                }`}
                                onChange={(date: Date | undefined) => {
                                  field.onChange(date ?? undefined);
                                }}
                                value={field.value}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FieldError errors={[fieldState.error]} />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Card>

            {/* Recap card */}
            <RecapPropositionCard
              address={address}
              desiredStartDate={desiredStartDate}
              durationDays={String(durationDays ?? '')}
              errorMessage={
                createMissionProposition.error instanceof Error
                  ? createMissionProposition.error.message
                  : createMissionProposition.error
                    ? String(createMissionProposition.error)
                    : null
              }
              isPeriodMode={durationMode === 'period'}
              isSubmitting={createMissionProposition.isPending}
              periodEndDate={periodEndDate}
              periodStartDate={periodStartDate}
              title={title}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
