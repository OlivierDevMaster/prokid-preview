'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formatISO } from 'date-fns';
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { rrulestr } from 'rrule';
import { toast } from 'sonner';

import type { AvailabilitySlot } from '@/features/availabilities/availability.model';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFindAvailabilitySlots } from '@/features/availabilities/hooks/useFindAvailabilitySlots';
import { useGroupedAvailabilitySlots } from '@/features/availabilities/hooks/useGroupedAvailabilitySlots';
import { useCreateMissionDirect } from '@/features/missions/hooks/useCreateMissionDirect';
import { useCreateMissionSchedules } from '@/features/missions/hooks/useCreateMissionSchedule';
import { Link } from '@/i18n/routing';

import { useGetProfessionals } from '../../professionals/hooks/useGetProfessionals';
import { useGetProfessionalAvailabilities } from '../hooks/useGetProfessionalAvailabilities';
import {
  type MissionFormData,
  missionFormSchema,
  type MissionSchedulesFormData,
  missionSchedulesFormSchema,
} from '../schemas/mission.schema';

export function CreateMissionForm() {
  const t = useTranslations('structure.missions');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { data: session } = useSession();
  const structureId = session?.user?.id;

  const [step, setStep] = useState<1 | 2>(1);
  const [createdMissionId, setCreatedMissionId] = useState<null | string>(null);
  const [missionUntilDate, setMissionUntilDate] = useState<Date | null>(null);
  const [currentWeek, setCurrentWeek] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);

  const { data: professionalsData } = useGetProfessionals();
  const professionals = professionalsData?.data ?? [];

  // Step 1 form
  const step1Form = useForm<MissionFormData>({
    defaultValues: {
      description: '',
      mission_dtstart: undefined,
      mission_until: undefined,
      professional_id: '',
      structure_id: structureId || '',
      title: '',
    },
    resolver: zodResolver(missionFormSchema),
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

  const createMission = useCreateMissionDirect();
  const createSchedules = useCreateMissionSchedules();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (structureId) {
      step1Form.setValue('structure_id', structureId);
    }
  }, [structureId, step1Form]);

  useEffect(() => {
    if (createdMissionId) {
      step2Form.setValue('mission_id', createdMissionId);
    }
  }, [createdMissionId, step2Form]);

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

  const handleStep1Submit = async (data: MissionFormData) => {
    if (!structureId) {
      toast.error('Structure ID is required');
      return;
    }

    try {
      const mission = await createMission.mutateAsync({
        description: data.description || null,
        mission_dtstart: formatISO(data.mission_dtstart),
        mission_until: formatISO(data.mission_until),
        professional_id: data.professional_id,
        structure_id: structureId,
        title: data.title,
      });

      setCreatedMissionId(mission.id);
      setMissionUntilDate(data.mission_until);
      setStep(2);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('createError') || 'Failed to create mission'
      );
    }
  };

  const handleStep2Submit = async (data: MissionSchedulesFormData) => {
    if (!missionUntilDate) {
      toast.error('Mission end date is required');
      return;
    }

    try {
      const schedulesToCreate = data.schedules.map(schedule => ({
        dtstart: schedule.dtstart || schedule.startAt,
        duration_mn: schedule.duration_mn,
        mission_id: data.mission_id,
        rrule: schedule.rrule,
        until: schedule.isRecurrent ? formatISO(missionUntilDate) : null,
      }));

      await createSchedules.mutateAsync(schedulesToCreate);

      toast.success(t('createSuccess') || 'Mission created successfully');
      router.push('/structure/missions');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('createError') || 'Failed to create schedules'
      );
    }
  };

  const handleAddSchedule = (slot: AvailabilitySlot) => {
    // Check if slot is already added
    const existingIndex = fields.findIndex(
      field =>
        field.availabilityStartAt === slot.startAt &&
        field.availabilityEndAt === slot.endAt
    );

    if (existingIndex !== -1) {
      toast.error('This availability is already added');
      return;
    }

    // Calculate duration in minutes
    const start = new Date(slot.startAt);
    const end = new Date(slot.endAt);
    const durationMn = Math.round((end.getTime() - start.getTime()) / 60000);

    // // Helper function to extract DTSTART from rrule string
    const extractDtstartFromRrule = (rruleString: string): Date | null => {
      if (!rruleString) return null;

      // Look for DTSTART in the rrule string
      // Format: DTSTART:20240101T090000 or DTSTART;TZID=Europe/Paris:20240101T090000
      const dtstartMatch = rruleString.match(
        /DTSTART[^:]*:(\d{8})T(\d{2})(\d{2})(\d{2})/
      );

      if (dtstartMatch) {
        const [, dateStr, hours, minutes, seconds] = dtstartMatch;
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
        const day = parseInt(dateStr.substring(6, 8), 10);
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const second = parseInt(seconds, 10);
        return new Date(year, month, day, hour, minute, second);
      }

      return null;
    };

    // Try to find matching availability to get rrule
    // Match by time and duration, using dtstart or extracting from rrule
    const slotStartTime = format(start, 'HH:mm');
    const matchingAvailability = availabilities.find(avail => {
      // Try to get start time from dtstart or rrule
      let availStart: Date | null = null;
      if (avail.dtstart) {
        availStart = new Date(avail.dtstart);
      } else if (avail.rrule) {
        availStart = extractDtstartFromRrule(avail.rrule);
      }

      console.info({
        d: availStart && format(availStart, 'dd/MM/yyyy HH:mm'),
        slotStartTime,
      });
      // If we can't determine start time, skip this availability
      if (!availStart) return false;

      const availStartTime = format(availStart, 'HH:mm');
      return availStartTime === slotStartTime;
    });

    console.info({ matchingAvailability });
    // // Check if availability is recurrent (has FREQ=WEEKLY or similar in rrule)
    // const isAvailabilityRecurrent = matchingAvailability?.rrule
    //   ? matchingAvailability.rrule.includes('FREQ=WEEKLY') ||
    //     matchingAvailability.rrule.includes('FREQ=DAILY') ||
    //     matchingAvailability.rrule.includes('FREQ=MONTHLY')
    //   : false;

    // // Always use rrule from matching availability if found, otherwise create a simple one
    // let rrule = matchingAvailability?.rrule;
    // if (!rrule) {
    //   const dayOfWeek = start.getDay();
    //   const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    //   rrule = `FREQ=WEEKLY;BYDAY=${dayNames[dayOfWeek]}`;
    // }

    // append({
    //   availabilityEndAt: slot.endAt,
    //   availabilityStartAt: slot.startAt,
    //   dtstart: slot.startAt,
    //   duration_mn: durationMn,
    //   endAt: slot.endAt,
    //   isAvailabilityRecurrent: isAvailabilityRecurrent,
    //   isRecurrent: false,
    //   rrule: rrule,
    //   startAt: slot.startAt,
    //   until: null,
    // });
  };

  const selectedProfessional = professionals.find(
    p => p.id === selectedProfessionalId
  );

  return (
    <div className='min-h-screen space-y-6 bg-blue-50/30 p-8'>
      <div className='flex items-center gap-3'>
        <Link href='/structure/missions'>
          <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
        </Link>
        <h1 className='text-3xl font-bold text-gray-800'>
          {t('createMission') || 'Create Mission'}
        </h1>
      </div>

      {/* Step Indicator */}
      <div className='flex items-center gap-2'>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          1
        </div>
        <div className='h-1 w-20 bg-gray-200'>
          <div
            className={`h-full transition-all ${
              step >= 2 ? 'bg-blue-500' : 'bg-gray-200'
            }`}
            style={{ width: step >= 2 ? '100%' : '0%' }}
          />
        </div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          2
        </div>
      </div>

      {step === 1 ? (
        <div className='rounded-lg border bg-white p-8'>
          <Form {...step1Form}>
            <form
              className='space-y-6'
              onSubmit={step1Form.handleSubmit(handleStep1Submit)}
            >
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

              {/* Professional Selection */}
              <FormField
                control={step1Form.control}
                name='professional_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('selectProfessional') || 'Select Professional'}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='h-auto min-h-[3.5rem] py-2'>
                          {selectedProfessional ? (
                            <div className='flex w-full items-center gap-3'>
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
                                    {selectedProfessional.name
                                      .charAt(0)
                                      .toUpperCase()}
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
                            <SelectValue
                              placeholder={
                                t('selectProfessionalPlaceholder') ||
                                'Select a professional'
                              }
                            />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-[400px]'>
                        {professionals.length === 0 ? (
                          <div className='px-2 py-6 text-center text-sm text-gray-500'>
                            {t('noProfessionals') || 'No professionals found'}
                          </div>
                        ) : (
                          professionals.map(professional => (
                            <SelectItem
                              key={professional.id}
                              textValue={professional.name}
                              value={professional.id}
                            >
                              <div className='flex w-full items-center gap-3 py-1'>
                                <div className='flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100'>
                                  {professional.avatarUrl ? (
                                    <Image
                                      alt={professional.name}
                                      className='h-full w-full object-cover'
                                      height={48}
                                      src={professional.avatarUrl}
                                      unoptimized
                                      width={48}
                                    />
                                  ) : (
                                    <span className='text-base font-semibold text-gray-500'>
                                      {professional.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className='flex flex-1 flex-col gap-1 overflow-hidden'>
                                  <div className='truncate font-medium text-gray-900'>
                                    {professional.name}
                                  </div>
                                  {professional.location && (
                                    <div className='truncate text-sm text-gray-600'>
                                      {professional.location}
                                    </div>
                                  )}
                                  {professional.skills &&
                                    professional.skills.length > 0 && (
                                      <div className='flex flex-wrap gap-1'>
                                        {professional.skills
                                          .slice(0, 3)
                                          .map((skill, index) => (
                                            <span
                                              className='rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700'
                                              key={index}
                                            >
                                              {skill}
                                            </span>
                                          ))}
                                        {professional.skills.length > 3 && (
                                          <span className='text-xs text-gray-500'>
                                            +{professional.skills.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mission Start Date */}
              <FormField
                control={step1Form.control}
                name='mission_dtstart'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('missionStartDate') || 'Mission Start Date'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        min={format(new Date(), 'yyyy-MM-dd HH:mm')}
                        onChange={e => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : undefined;
                          field.onChange(date);
                        }}
                        type='datetime'
                        value={
                          field.value
                            ? format(new Date(field.value), 'yyyy-MM-dd HH:mm')
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                    : new Date();

                  return (
                    <FormItem>
                      <FormLabel>
                        {t('missionEndDate') || 'Mission End Date'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          min={minDate.toISOString().slice(0, 16)}
                          onChange={e => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : undefined;
                            field.onChange(date);
                          }}
                          type='datetime'
                          value={
                            field.value
                              ? new Date(field.value).toISOString().slice(0, 16)
                              : ''
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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

              {/* Submit Button */}
              <div className='flex justify-end gap-3'>
                <Button
                  onClick={() => router.back()}
                  type='button'
                  variant='outline'
                >
                  {t('cancel') || 'Cancel'}
                </Button>
                <Button
                  className='bg-blue-500 text-white hover:bg-blue-600'
                  disabled={createMission.isPending}
                  type='submit'
                >
                  {createMission.isPending
                    ? t('creating') || 'Creating...'
                    : t('next') || 'Next'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <Form {...step2Form}>
          <form
            className='space-y-6'
            onSubmit={step2Form.handleSubmit(handleStep2Submit)}
          >
            {/* Availability Calendar */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold text-gray-800'>
                  {t('selectAvailabilities') || 'Select Availabilities'}
                </h2>
              </div>

              {/* Weekly Navigation */}
              <div className='rounded-lg border border-gray-200 bg-white p-4'>
                <div className='mb-4 flex items-center justify-between'>
                  <Button
                    className='text-gray-600 hover:text-gray-800'
                    onClick={goToPreviousWeek}
                    size='sm'
                    type='button'
                    variant='ghost'
                  >
                    <ChevronLeft className='mr-1 h-4 w-4' />
                    {t('previousWeek') || 'Previous Week'}
                  </Button>
                  <h3 className='text-lg font-bold text-blue-900'>
                    {t('weekOf') || 'Week of'}{' '}
                    {mounted &&
                      format(weekStart, 'd MMMM yyyy', { locale: fr })}
                  </h3>
                  <Button
                    className='text-gray-600 hover:text-gray-800'
                    onClick={goToNextWeek}
                    size='sm'
                    type='button'
                    variant='ghost'
                  >
                    {t('nextWeek') || 'Next Week'}
                    <ChevronRight className='ml-1 h-4 w-4' />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className='grid grid-cols-7 gap-3'>
                  {weekDays.map((day, index) => {
                    const isToday = mounted && isSameDay(day, new Date());
                    const dayName = dayNames[index];
                    const dayNumber = format(day, 'd');
                    const month = format(day, 'MMM', { locale: fr });
                    const daySlots = groupedSlots.getSlotsByDay(day);

                    return (
                      <Card
                        className={`min-h-[200px] rounded-lg border-2 bg-white shadow-sm ${
                          isToday
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        key={index}
                      >
                        <div className='p-2'>
                          <div className='mb-1 text-sm font-bold text-blue-900'>
                            {dayName}
                          </div>
                          <div className='mb-4 text-sm text-blue-900'>
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
                                    className='w-full justify-start border border-green-300 bg-green-50 px-2 text-green-700 hover:bg-green-100'
                                    key={slotIndex}
                                    onClick={() => handleAddSchedule(slot)}
                                    size='sm'
                                    type='button'
                                  >
                                    <Plus className='h-3 w-3' />
                                    {startTime} - {endTime}
                                  </Button>
                                );
                              })}
                            {daySlots.filter(slot => slot.isAvailable)
                              .length === 0 && (
                              <div className='text-xs text-gray-400'>
                                {t('noSlots') || 'No slots'}
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
              <div className='space-y-4'>
                <h3 className='text-lg font-bold text-gray-800'>
                  {t('selectedSchedules') || 'Selected Schedules'}
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

                    // Get current start time
                    const currentStart = new Date(field.startAt);

                    // Create min/max datetime strings for time pickers
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
                      <Card className='p-4' key={field.id}>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1 space-y-4'>
                            <div>
                              <div className='font-medium text-gray-900'>
                                {format(
                                  new Date(field.startAt),
                                  'EEEE, d MMMM yyyy',
                                  { locale: fr }
                                )}
                              </div>
                              <div className='mt-1 text-xs text-gray-500'>
                                {t('availabilityRange') || 'Availability range'}
                                : {availabilityStartTime} -{' '}
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
                                    {t('scheduleStartTime') || 'Start Time'}
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

                                        // Update end time if it's before new start
                                        const currentEndDate = new Date(
                                          step2Form.getValues(
                                            `schedules.${index}.endAt`
                                          )
                                        );
                                        if (currentEndDate <= newStart) {
                                          // Set end time to min of (new start + 1 minute, availability end)
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

                                        // Recalculate duration
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
                                      type='datetime'
                                      value={
                                        startField.value
                                          ? new Date(startField.value)
                                              .toISOString()
                                              .slice(0, 16)
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
                                  <FormLabel>
                                    {t('scheduleEndTime') || 'End Time'}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      max={maxEndTime}
                                      min={minEndTime}
                                      onChange={e => {
                                        const newEnd = e.target.value
                                          ? new Date(e.target.value)
                                          : availabilityEnd;
                                        endField.onChange(newEnd.toISOString());

                                        // Recalculate duration
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
                                      type='datetime'
                                      value={
                                        endField.value
                                          ? new Date(endField.value)
                                              .toISOString()
                                              .slice(0, 16)
                                          : ''
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className='text-sm text-gray-500'>
                              {Math.floor(field.duration_mn / 60)}h{' '}
                              {field.duration_mn % 60}min
                            </div>

                            {/* Recurrent Checkbox - Only enabled if availability is recurrent */}
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
                            className='text-red-600 hover:text-red-700'
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
            <div className='flex justify-end gap-3'>
              <Button
                onClick={() => setStep(1)}
                type='button'
                variant='outline'
              >
                {t('back') || 'Back'}
              </Button>
              <Button
                className='bg-blue-500 text-white hover:bg-blue-600'
                disabled={createSchedules.isPending || fields.length === 0}
                type='submit'
              >
                {createSchedules.isPending
                  ? t('creating') || 'Creating...'
                  : t('create') || 'Create Mission'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
