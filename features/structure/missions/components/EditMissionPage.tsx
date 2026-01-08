'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format, formatISO } from 'date-fns';
import { addDays, addWeeks, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { RRuleSet, rrulestr } from 'rrule';
import { toast } from 'sonner';

import type { AvailabilitySlot } from '@/features/availabilities/availability.model';
import type { Database } from '@/types/database/schema';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFindAvailabilitySlots } from '@/features/availabilities/hooks/useFindAvailabilitySlots';
import { useGroupedAvailabilitySlots } from '@/features/availabilities/hooks/useGroupedAvailabilitySlots';
import { useGetMissionSchedules } from '@/features/missions/hooks/useGetMissionSchedules';
import { useUpdateMissionSchedules } from '@/features/missions/hooks/useUpdateMissionSchedules';
import {
  getMissionStatusConfig,
  MissionStatus,
} from '@/features/missions/mission.model';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import { useGetProfessionals } from '../../professionals/hooks/useGetProfessionals';
import { useGetMission } from '../hooks/useGetMission';
import { useGetProfessionalAvailabilities } from '../hooks/useGetProfessionalAvailabilities';
import { useUpdateMission } from '../hooks/useUpdateMission';
import {
  type EditMissionFormData,
  editMissionFormSchema,
  type MissionSchedulesFormData,
  missionSchedulesFormSchema,
} from '../schemas/mission.schema';

interface EditMissionPageProps {
  missionId: string;
}

export function EditMissionPage({ missionId }: EditMissionPageProps) {
  const t = useTranslations('structure.missions');
  const tCommon = useTranslations('common');
  const locale = (useLocale() as 'en' | 'fr') || 'en';
  const router = useRouter();
  const { data: mission, isLoading } = useGetMission(missionId);
  const { data: existingSchedules, isLoading: isLoadingSchedules } =
    useGetMissionSchedules(missionId);
  const updateMission = useUpdateMission();
  const updateSchedules = useUpdateMissionSchedules();

  const [step, setStep] = useState<1 | 2>(1);
  const [missionUntilDate, setMissionUntilDate] = useState<Date | null>(null);
  const [currentWeek, setCurrentWeek] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);

  const { data: professionalsData } = useGetProfessionals();
  const professionals = professionalsData?.data ?? [];

  // Step 1 form
  const step1Form = useForm<EditMissionFormData>({
    defaultValues: {
      description: '',
      is_draft: false,
      mission_dtstart: undefined,
      mission_until: undefined,
      professional_id: '',
      structure_id: '',
      title: '',
    },
    resolver: zodResolver(editMissionFormSchema),
  });

  // Step 2 form
  const step2Form = useForm<MissionSchedulesFormData>({
    defaultValues: {
      mission_id: '',
      schedules: [],
    },
    resolver: zodResolver(missionSchedulesFormSchema),
  });

  const { append, fields, remove } = useFieldArray({
    control: step2Form.control,
    name: 'schedules',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to extract DTSTART from rrule string
  const extractDtstartFromRrule = (rruleString: string): Date | null => {
    if (!rruleString) return null;

    try {
      const rule = rrulestr(rruleString);

      if (
        rule instanceof RRuleSet ||
        typeof (rule as RRuleSet).rrules === 'function'
      ) {
        const rruleSet = rule as RRuleSet;
        const rules = rruleSet.rrules();

        if (rules.length > 0 && rules[0].options.dtstart) {
          return rules[0].options.dtstart;
        }

        return null;
      }

      return rule.options.dtstart || null;
    } catch (error) {
      console.error('Error parsing rrule:', error);
      return null;
    }
  };

  // Convert existing schedules to form format
  useEffect(() => {
    if (existingSchedules && existingSchedules.length > 0 && mission) {
      const convertedSchedules = existingSchedules.map(schedule => {
        const dtstart = schedule.dtstart
          ? new Date(schedule.dtstart)
          : extractDtstartFromRrule(schedule.rrule);
        const until = schedule.until ? new Date(schedule.until) : null;
        const isRecurrent =
          schedule.rrule.includes('FREQ=WEEKLY') ||
          schedule.rrule.includes('FREQ=DAILY') ||
          schedule.rrule.includes('FREQ=MONTHLY');

        // Calculate startAt and endAt from dtstart and duration
        const startAt = dtstart ? dtstart.toISOString() : '';
        const endAt = dtstart
          ? new Date(
              dtstart.getTime() + schedule.duration_mn * 60000
            ).toISOString()
          : '';

        // For existing schedules, we don't have availability info, so use schedule times
        const availabilityStartAt = startAt;
        const availabilityEndAt = endAt;

        return {
          availabilityEndAt,
          availabilityStartAt,
          dtstart: startAt,
          duration_mn: schedule.duration_mn,
          endAt,
          isAvailabilityRecurrent: isRecurrent,
          isRecurrent: !!until,
          rrule: schedule.rrule,
          scheduleId: schedule.id, // Store original ID for updates
          startAt,
          until: until ? until.toISOString() : null,
        };
      });

      step2Form.reset({
        mission_id: missionId,
        schedules: convertedSchedules,
      });
    }
  }, [existingSchedules, mission, missionId, step2Form]);

  useEffect(() => {
    if (mission) {
      step1Form.reset({
        description: mission.description || '',
        is_draft: mission.status === 'draft',
        mission_dtstart: new Date(mission.mission_dtstart),
        mission_until: new Date(mission.mission_until),
        professional_id: mission.professional_id,
        structure_id: mission.structure_id,
        title: mission.title,
      });
      setMissionUntilDate(new Date(mission.mission_until));
      step2Form.setValue('mission_id', missionId);
    }
  }, [mission, missionId, step1Form, step2Form]);

  // Get selected professional from step 1
  const selectedProfessionalId = step1Form.watch('professional_id');

  // Get availability slots for selected professional
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: slots = [] } = useFindAvailabilitySlots({
    endAt: weekEnd.toISOString(),
    professionalId: selectedProfessionalId || '',
    startAt: weekStart.toISOString(),
  });

  // Get availabilities to match with slots for rrule
  const { data: availabilitiesData } = useGetProfessionalAvailabilities(
    selectedProfessionalId || null
  );
  const availabilities = availabilitiesData?.data ?? [];

  const groupedSlots = useGroupedAvailabilitySlots(slots);

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const dayNames = [
    tCommon('days.monday'),
    tCommon('days.tuesday'),
    tCommon('days.wednesday'),
    tCommon('days.thursday'),
    tCommon('days.friday'),
    tCommon('days.saturday'),
    tCommon('days.sunday'),
  ];

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleStep1Submit = async (data: EditMissionFormData) => {
    if (!mission) return;

    try {
      const newStatus = data.is_draft
        ? 'draft'
        : mission.status === 'draft'
          ? 'pending'
          : mission.status;

      await updateMission.mutateAsync({
        missionId: mission.id,
        updateData: {
          description: data.description || null,
          mission_dtstart: formatISO(data.mission_dtstart),
          mission_until: formatISO(data.mission_until),
          status: newStatus as Database['public']['Enums']['mission_status'],
          title: data.title,
        },
      });

      setMissionUntilDate(data.mission_until);
      setStep(2);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('updateError') || 'Failed to update mission'
      );
    }
  };

  const handleStep2Submit = async (data: MissionSchedulesFormData) => {
    if (!mission || !missionUntilDate) {
      toast.error(t('missionEndDateRequired'));
      return;
    }

    try {
      // Separate schedules into: new, updated, and to delete
      const existingScheduleIds = new Set(
        existingSchedules?.map(s => s.id) || []
      );
      const formScheduleIds = new Set(
        data.schedules
          .map(s => {
            const scheduleWithId = s as {
              scheduleId?: string;
            } & MissionScheduleFormData;
            return scheduleWithId.scheduleId;
          })
          .filter((id): id is string => !!id)
      );

      // Schedules to delete (exist in DB but not in form)
      const scheduleIdsToDelete = Array.from(existingScheduleIds).filter(
        id => !formScheduleIds.has(id)
      );

      // Schedules to update (exist in both)
      const schedulesToUpdate = data.schedules
        .map(s => {
          const scheduleWithId = s as {
            scheduleId?: string;
          } & MissionScheduleFormData;
          return scheduleWithId;
        })
        .filter(s => s.scheduleId)
        .map(schedule => {
          const scheduleId = schedule.scheduleId!;
          return {
            data: {
              dtstart: schedule.dtstart || schedule.startAt,
              duration_mn: schedule.duration_mn,
              rrule: schedule.rrule,
              until: schedule.isRecurrent ? formatISO(missionUntilDate) : null,
            },
            id: scheduleId,
          };
        });

      // Schedules to create (new ones without scheduleId)
      const schedulesToCreate = data.schedules
        .map(s => {
          const scheduleWithId = s as {
            scheduleId?: string;
          } & MissionScheduleFormData;
          return scheduleWithId;
        })
        .filter(s => !s.scheduleId)
        .map(schedule => ({
          dtstart: schedule.dtstart || schedule.startAt,
          duration_mn: schedule.duration_mn,
          mission_id: missionId,
          rrule: schedule.rrule,
          until: schedule.isRecurrent ? formatISO(missionUntilDate) : null,
        }));

      await updateSchedules.mutateAsync({
        missionId: mission.id,
        scheduleIdsToDelete,
        schedulesToCreate,
        schedulesToUpdate,
      });

      toast.success(t('updateSuccess') || 'Mission updated successfully');
      router.push('/structure/missions');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('updateError') || 'Failed to update schedules'
      );
    }
  };

  const handleAddSchedule = (slot: AvailabilitySlot) => {
    const existingIndex = fields.findIndex(
      field =>
        field.availabilityStartAt === slot.startAt &&
        field.availabilityEndAt === slot.endAt
    );

    if (existingIndex !== -1) {
      toast.error(t('availabilityAlreadyAdded'));
      return;
    }

    const start = new Date(slot.startAt);
    const end = new Date(slot.endAt);
    const durationMn = Math.round((end.getTime() - start.getTime()) / 60000);

    const slotStartTime = format(start, 'HH:mm');
    const matchingAvailability = availabilities.find(avail => {
      let availStart: Date | null = null;
      if (avail.dtstart) {
        availStart = new Date(avail.dtstart);
      } else if (avail.rrule) {
        availStart = extractDtstartFromRrule(avail.rrule);
      }

      if (!availStart) return false;

      const availStartTime = format(availStart, 'HH:mm');
      return availStartTime === slotStartTime;
    });

    const isAvailabilityRecurrent = matchingAvailability?.rrule
      ? matchingAvailability.rrule.includes('FREQ=WEEKLY') ||
        matchingAvailability.rrule.includes('FREQ=DAILY') ||
        matchingAvailability.rrule.includes('FREQ=MONTHLY')
      : false;

    let rrule = matchingAvailability?.rrule;
    if (!rrule) {
      const dayOfWeek = start.getDay();
      const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      rrule = `FREQ=WEEKLY;BYDAY=${dayNames[dayOfWeek]}`;
    }

    append({
      availabilityEndAt: slot.endAt,
      availabilityStartAt: slot.startAt,
      dtstart: slot.startAt,
      duration_mn: durationMn,
      endAt: slot.endAt,
      isAvailabilityRecurrent: isAvailabilityRecurrent,
      isRecurrent: false,
      rrule: rrule,
      startAt: slot.startAt,
      until: null,
    });
  };

  const selectedProfessional = professionals.find(
    p => p.id === selectedProfessionalId
  );

  if (isLoading || isLoadingSchedules) {
    return (
      <div className='min-h-screen space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
        <div className='py-8 text-center text-gray-600'>{t('loading')}</div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className='min-h-screen space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
        <div className='py-8 text-center text-gray-600'>{t('noMissions')}</div>
      </div>
    );
  }

  const statusConfig = getMissionStatusConfig(locale);
  const status = statusConfig[mission.status] || statusConfig.pending;
  const canEdit =
    mission.status === MissionStatus.pending ||
    mission.status === MissionStatus.draft;

  return (
    <div className='min-h-screen space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
      <div className='flex items-center gap-2 sm:gap-3'>
        <Link href='/structure/missions'>
          <ArrowLeft className='h-4 w-4 cursor-pointer text-gray-600 hover:text-gray-800 sm:h-5 sm:w-5' />
        </Link>
        <h1 className='text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl'>
          {canEdit
            ? t('editMission') || 'Edit Mission'
            : t('viewMission') || 'View Mission'}
        </h1>
      </div>

      {!canEdit && (
        <Card className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
          <div className='flex items-center gap-2 text-orange-800'>
            <Lock className='h-4 w-4' />
            <p className='text-sm font-medium'>
              {t('missionReadOnly') ||
                'This mission cannot be edited because it is not in pending or draft status.'}
            </p>
          </div>
        </Card>
      )}

      {canEdit && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='flex flex-col items-center gap-1'>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold sm:h-8 sm:w-8 ${
                  step >= 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  step >= 1 ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {t('step1Title') || 'Mission Information'}
              </span>
            </div>
            <div className='h-1 flex-1 bg-gray-200'>
              <div
                className={`h-full transition-all ${
                  step >= 2 ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                style={{ width: step >= 2 ? '100%' : '0%' }}
              />
            </div>
            <div className='flex flex-col items-center gap-1'>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold sm:h-8 sm:w-8 ${
                  step >= 2
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  step >= 2 ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {t('step2Title') || 'Select Availabilities'}
              </span>
            </div>
          </div>
        </div>
      )}

      {step === 1 ? (
        <div className='rounded-lg border bg-white p-4 sm:p-6 lg:p-8'>
          {canEdit ? (
            <Form {...step1Form}>
              <form
                className='space-y-4 sm:space-y-6'
                onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              >
                {/* Status Badge */}
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
                    status.bgColor,
                    status.textColor
                  )}
                >
                  <div
                    className={cn('h-2 w-2 rounded-full', status.dotColor)}
                  />
                  <span className='text-xs font-medium'>{status.label}</span>
                </div>

                {/* Title */}
                <FormField
                  control={step1Form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('title') || 'Title'}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            t('titlePlaceholder') || 'Enter mission title'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Professional Selection (Read-only) */}
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    {t('selectProfessional') || 'Select Professional'}
                  </label>
                  {selectedProfessional ? (
                    <div className='mt-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
                        {selectedProfessional.avatarUrl ? (
                          <Image
                            alt={selectedProfessional.name}
                            className='h-full w-full object-cover'
                            height={40}
                            src={selectedProfessional.avatarUrl}
                            unoptimized
                            width={40}
                          />
                        ) : (
                          <span className='text-sm font-semibold text-gray-500'>
                            {selectedProfessional.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className='flex-1 truncate text-left'>
                        <div className='truncate font-medium text-gray-900'>
                          {selectedProfessional.name}
                        </div>
                        {selectedProfessional.location && (
                          <div className='truncate text-sm text-gray-500'>
                            {selectedProfessional.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className='mt-1 text-sm text-gray-500'>
                      {t('noProfessional') || 'No professional selected'}
                    </p>
                  )}
                </div>

                {/* Mission Start Date */}
                <FormField
                  control={step1Form.control}
                  name='mission_dtstart'
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>
                          {t('missionStartDate') || 'Mission Start Date'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            onChange={e => {
                              const date = e.target.value
                                ? new Date(e.target.value)
                                : undefined;
                              field.onChange(date);
                            }}
                            type='datetime-local'
                            value={
                              field.value
                                ? format(
                                    new Date(field.value),
                                    "yyyy-MM-dd'T'HH:mm"
                                  )
                                : ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Mission End Date */}
                <FormField
                  control={step1Form.control}
                  name='mission_until'
                  render={({ field }) => {
                    const startDate = step1Form.watch('mission_dtstart');
                    const minDate = startDate
                      ? (() => {
                          const date = new Date(startDate);
                          date.setMinutes(date.getMinutes() + 1);
                          return date;
                        })()
                      : undefined;
                    const minDateTime = minDate
                      ? format(minDate, "yyyy-MM-dd'T'HH:mm")
                      : undefined;

                    return (
                      <FormItem>
                        <FormLabel>
                          {t('missionEndDate') || 'Mission End Date'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            min={minDateTime}
                            onChange={e => {
                              const date = e.target.value
                                ? new Date(e.target.value)
                                : undefined;
                              field.onChange(date);
                            }}
                            type='datetime-local'
                            value={
                              field.value
                                ? format(
                                    new Date(field.value),
                                    "yyyy-MM-dd'T'HH:mm"
                                  )
                                : ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Draft Checkbox */}
                <FormField
                  control={step1Form.control}
                  name='is_draft'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel className='cursor-pointer text-sm font-normal'>
                          {t('isDraft') || 'Save as draft'}
                        </FormLabel>
                        <FormDescription className='text-xs'>
                          {t('isDraftDescription') ||
                            'If checked, the mission will be saved as a draft and will not be sent to the professional'}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={step1Form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('description') || 'Description'} (
                        {t('optional') || 'Optional'})
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            t('descriptionPlaceholder') ||
                            'Enter mission description'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                  <Button
                    className='w-full sm:w-auto'
                    onClick={() => router.push('/structure/missions')}
                    type='button'
                    variant='outline'
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    className='w-full bg-blue-500 text-white hover:bg-blue-600 sm:w-auto'
                    disabled={updateMission.isPending}
                    type='submit'
                  >
                    {updateMission.isPending ? t('updating') : t('next')}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className='space-y-4 sm:space-y-6'>
              {/* Status Badge */}
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
                  status.bgColor,
                  status.textColor
                )}
              >
                <div className={cn('h-2 w-2 rounded-full', status.dotColor)} />
                <span className='text-xs font-medium'>{status.label}</span>
              </div>

              {/* Read-only fields */}
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    {t('title') || 'Title'}
                  </label>
                  <p className='mt-1 text-sm text-gray-900'>{mission.title}</p>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    {t('missionStartDate') || 'Mission Start Date'}
                  </label>
                  <p className='mt-1 text-sm text-gray-900'>
                    {format(new Date(mission.mission_dtstart), 'PPpp')}
                  </p>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    {t('missionEndDate') || 'Mission End Date'}
                  </label>
                  <p className='mt-1 text-sm text-gray-900'>
                    {format(new Date(mission.mission_until), 'PPpp')}
                  </p>
                </div>

                {mission.description && (
                  <div>
                    <label className='text-sm font-medium text-gray-700'>
                      {t('description') || 'Description'}
                    </label>
                    <p className='mt-1 text-sm text-gray-900'>
                      {mission.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Back Button */}
              <div className='flex justify-end'>
                <Button
                  onClick={() => router.push('/structure/missions')}
                  variant='outline'
                >
                  {t('back')}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Form {...step2Form}>
          <form
            className='space-y-4 sm:space-y-6'
            onSubmit={step2Form.handleSubmit(handleStep2Submit)}
          >
            {/* Availability Calendar */}
            <div className='space-y-3 sm:space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-bold text-gray-800 sm:text-xl'>
                  {t('selectAvailabilities') || 'Select Availabilities'}
                </h2>
              </div>

              {/* Weekly Navigation */}
              <div className='rounded-lg border border-gray-200 bg-white p-3 sm:p-4'>
                <div className='mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-4'>
                  <Button
                    className='text-gray-600 hover:text-gray-800'
                    onClick={goToPreviousWeek}
                    size='sm'
                    type='button'
                    variant='ghost'
                  >
                    <ChevronLeft className='h-4 w-4 sm:mr-1' />
                    <span className='hidden sm:inline'>
                      {t('previousWeek')}
                    </span>
                  </Button>
                  <h3 className='flex-1 text-center text-sm font-bold text-blue-900 sm:text-base lg:text-lg'>
                    <span className='hidden sm:inline'>
                      {t('weekOf')}{' '}
                      {mounted &&
                        format(weekStart, 'd MMMM yyyy', { locale: fr })}
                    </span>
                    <span className='sm:hidden'>
                      {mounted &&
                        format(weekStart, 'd MMM yyyy', { locale: fr })}
                    </span>
                  </h3>
                  <Button
                    className='text-gray-600 hover:text-gray-800'
                    onClick={goToNextWeek}
                    size='sm'
                    type='button'
                    variant='ghost'
                  >
                    <span className='hidden sm:inline'>{t('nextWeek')}</span>
                    <ChevronRight className='h-4 w-4 sm:ml-1' />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
                  {weekDays.map((day, index) => {
                    const isToday = mounted && isSameDay(day, new Date());
                    const dayName = dayNames[index];
                    const dayNumber = format(day, 'd');
                    const month = format(day, 'MMM', { locale: fr });
                    const daySlots = groupedSlots.getSlotsByDay(day);

                    return (
                      <Card
                        className={`min-h-[150px] rounded-lg border-2 bg-white shadow-sm sm:min-h-[180px] lg:min-h-[200px] ${
                          isToday
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        key={index}
                      >
                        <div className='p-2 sm:p-3'>
                          <div className='mb-1 text-xs font-bold text-blue-900 sm:text-sm'>
                            {dayName}
                          </div>
                          <div className='mb-3 text-xs text-blue-900 sm:mb-4 sm:text-sm'>
                            {dayNumber} {month}
                          </div>
                          <div className='space-y-2'>
                            {daySlots
                              .filter(slot => slot.isAvailable)
                              .map((slot, slotIndex) => {
                                const startTime = format(
                                  new Date(slot.startAt),
                                  'HH:mm'
                                );
                                const endTime = format(
                                  new Date(slot.endAt),
                                  'HH:mm'
                                );

                                return (
                                  <Button
                                    className='w-full justify-start border border-green-300 bg-green-50 px-2 text-xs text-green-700 hover:bg-green-100 sm:text-sm'
                                    key={slotIndex}
                                    onClick={() => handleAddSchedule(slot)}
                                    size='sm'
                                    type='button'
                                  >
                                    <Plus className='h-3 w-3' />
                                    <span className='truncate'>
                                      {startTime} - {endTime}
                                    </span>
                                  </Button>
                                );
                              })}
                            {daySlots.filter(slot => slot.isAvailable)
                              .length === 0 && (
                              <div className='text-xs text-gray-400'>
                                {t('noSlots')}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Schedules */}
            {fields.length > 0 && (
              <div className='space-y-3 sm:space-y-4'>
                <h3 className='text-base font-bold text-gray-800 sm:text-lg'>
                  {t('selectedSchedules')}
                </h3>
                <div className='space-y-3'>
                  {fields.map((field, index) => {
                    const availabilityStart = new Date(
                      field.availabilityStartAt
                    );
                    const availabilityEnd = new Date(field.availabilityEndAt);
                    const availabilityStartTime = format(
                      availabilityStart,
                      'HH:mm'
                    );
                    const availabilityEndTime = format(
                      availabilityEnd,
                      'HH:mm'
                    );

                    const currentStart = new Date(field.startAt);

                    const minStartTime = format(
                      availabilityStart,
                      "yyyy-MM-dd'T'HH:mm"
                    );
                    const maxStartTime = format(
                      availabilityEnd,
                      "yyyy-MM-dd'T'HH:mm"
                    );
                    const minEndTime = format(
                      currentStart,
                      "yyyy-MM-dd'T'HH:mm"
                    );
                    const maxEndTime = format(
                      availabilityEnd,
                      "yyyy-MM-dd'T'HH:mm"
                    );

                    return (
                      <Card className='p-3 sm:p-4' key={field.id}>
                        <div className='flex items-start justify-between gap-3 sm:gap-4'>
                          <div className='min-w-0 flex-1 space-y-3 sm:space-y-4'>
                            <div>
                              <div className='text-sm font-medium text-gray-900 sm:text-base'>
                                <span className='hidden sm:inline'>
                                  {format(
                                    new Date(field.startAt),
                                    'EEEE, d MMMM yyyy',
                                    { locale: fr }
                                  )}
                                </span>
                                <span className='sm:hidden'>
                                  {format(
                                    new Date(field.startAt),
                                    'EEE, d MMM yyyy',
                                    { locale: fr }
                                  )}
                                </span>
                              </div>
                              <div className='mt-1 text-xs text-gray-500'>
                                {t('availabilityRange')}: {t('from')}{' '}
                                {availabilityStartTime} {t('to')}
                                {availabilityEndTime}
                              </div>
                            </div>

                            {/* Start Time Picker */}
                            <FormField
                              control={step2Form.control}
                              name={`schedules.${index}.startAt`}
                              render={({ field: startField }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t('scheduleStartTime')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      max={maxStartTime}
                                      min={minStartTime}
                                      onChange={e => {
                                        const newStart = e.target.value
                                          ? new Date(e.target.value)
                                          : availabilityStart;
                                        startField.onChange(
                                          newStart.toISOString()
                                        );

                                        const currentEndDate = new Date(
                                          step2Form.getValues(
                                            `schedules.${index}.endAt`
                                          )
                                        );
                                        if (currentEndDate <= newStart) {
                                          const newEnd = new Date(newStart);
                                          newEnd.setMinutes(
                                            newEnd.getMinutes() + 1
                                          );
                                          if (newEnd > availabilityEnd) {
                                            step2Form.setValue(
                                              `schedules.${index}.endAt`,
                                              availabilityEnd.toISOString()
                                            );
                                          } else {
                                            step2Form.setValue(
                                              `schedules.${index}.endAt`,
                                              newEnd.toISOString()
                                            );
                                          }
                                        }

                                        const endDate = new Date(
                                          step2Form.getValues(
                                            `schedules.${index}.endAt`
                                          )
                                        );
                                        const durationMn = Math.round(
                                          (endDate.getTime() -
                                            newStart.getTime()) /
                                            60000
                                        );
                                        step2Form.setValue(
                                          `schedules.${index}.duration_mn`,
                                          durationMn
                                        );
                                        step2Form.setValue(
                                          `schedules.${index}.dtstart`,
                                          newStart.toISOString()
                                        );
                                      }}
                                      type='datetime-local'
                                      value={
                                        startField.value
                                          ? format(
                                              new Date(startField.value),
                                              "yyyy-MM-dd'T'HH:mm"
                                            )
                                          : ''
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* End Time Picker */}
                            <FormField
                              control={step2Form.control}
                              name={`schedules.${index}.endAt`}
                              render={({ field: endField }) => (
                                <FormItem>
                                  <FormLabel>{t('scheduleEndTime')}</FormLabel>
                                  <FormControl>
                                    <Input
                                      max={maxEndTime}
                                      min={minEndTime}
                                      onChange={e => {
                                        const newEnd = e.target.value
                                          ? new Date(e.target.value)
                                          : availabilityEnd;
                                        endField.onChange(newEnd.toISOString());

                                        const startDate = new Date(
                                          step2Form.getValues(
                                            `schedules.${index}.startAt`
                                          )
                                        );
                                        const durationMn = Math.round(
                                          (newEnd.getTime() -
                                            startDate.getTime()) /
                                            60000
                                        );
                                        step2Form.setValue(
                                          `schedules.${index}.duration_mn`,
                                          durationMn
                                        );
                                      }}
                                      type='datetime-local'
                                      value={
                                        endField.value
                                          ? format(
                                              new Date(endField.value),
                                              "yyyy-MM-dd'T'HH:mm"
                                            )
                                          : ''
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className='text-sm text-gray-500'>
                              {t('duration')}:{' '}
                              {Math.floor(field.duration_mn / 60)}h{' '}
                              {field.duration_mn % 60}min
                            </div>

                            {/* Recurrent Checkbox */}
                            <FormField
                              control={step2Form.control}
                              name={`schedules.${index}.isRecurrent`}
                              render={({ field: checkboxField }) => (
                                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                  <FormControl>
                                    <Checkbox
                                      checked={checkboxField.value}
                                      disabled={!field.isAvailabilityRecurrent}
                                      onCheckedChange={checkboxField.onChange}
                                    />
                                  </FormControl>
                                  <div className='space-y-1 leading-none'>
                                    <FormLabel
                                      className={`cursor-pointer text-sm font-normal ${
                                        !field.isAvailabilityRecurrent
                                          ? 'text-gray-400'
                                          : ''
                                      }`}
                                    >
                                      {t('recurrent') || 'Recurrent'}
                                    </FormLabel>
                                    <FormDescription className='text-xs'>
                                      {field.isAvailabilityRecurrent
                                        ? t('recurrentDescription') ||
                                          'If checked, this schedule will repeat until the mission end date'
                                        : t('recurrentNotAvailable') ||
                                          'This option is only available for recurrent availabilities'}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            className='flex-shrink-0 text-red-600 hover:text-red-700'
                            onClick={() => remove(index)}
                            size='sm'
                            type='button'
                            variant='ghost'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
              <Button
                className='w-full sm:w-auto'
                onClick={() => setStep(1)}
                type='button'
                variant='outline'
              >
                {t('back')}
              </Button>
              <Button
                className='w-full bg-blue-500 text-white hover:bg-blue-600 sm:w-auto'
                disabled={updateSchedules.isPending || fields.length === 0}
                type='submit'
              >
                {updateSchedules.isPending ? t('updating') : t('update')}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
