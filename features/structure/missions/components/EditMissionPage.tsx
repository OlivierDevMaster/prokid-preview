'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { addDays, addWeeks, isSameDay, startOfWeek, subWeeks } from 'date-fns';
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
import { ByWeekday, Options, RRule, RRuleSet, rrulestr } from 'rrule';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFindAvailabilitySlots } from '@/features/availabilities/hooks/useFindAvailabilitySlots';
import { useGroupedAvailabilitySlots } from '@/features/availabilities/hooks/useGroupedAvailabilitySlots';
import { useGetMissionSchedules } from '@/features/missions/hooks/useGetMissionSchedules';
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
  MissionScheduleSchema,
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

  const [step, setStep] = useState<1 | 2>(1);
  const [currentWeek, setCurrentWeek] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);

  const { data: professionalsData } = useGetProfessionals();
  const professionals = professionalsData?.data ?? [];

  const form = useForm<EditMissionFormData>({
    resolver: zodResolver(editMissionFormSchema),
  });

  const { control, getValues, setValue, watch } = form;

  const { append, fields, remove } = useFieldArray({
    control: control,
    name: 'missionSchedules',
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

  // Helper function to set UNTIL in rrule using the rrule library
  const setRruleUntil = (rruleString: string, untilDate: Date): string => {
    try {
      const rule = rrulestr(rruleString);
      let options: Partial<Options>;

      if (rule instanceof RRuleSet) {
        const rruleSet = rule as RRuleSet;
        const rules = rruleSet.rrules();
        if (rules.length > 0) {
          options = { ...rules[0].options };
        } else {
          return rruleString; // Return original if no rules found
        }
      } else {
        options = { ...rule.options };
      }

      // Set the until date
      options.until = untilDate;

      // Create new RRule with updated options
      const newRule = new RRule(options);
      return newRule.toString();
    } catch (error) {
      console.error('Error setting UNTIL in rrule:', error);
      return rruleString; // Return original on error
    }
  };

  // Helper function to update DTSTART in rrule
  const updateRruleDtstart = (
    rruleString: string,
    newDtstart: Date
  ): string => {
    try {
      const rule = rrulestr(rruleString);
      let options: Partial<Options>;

      if (rule instanceof RRuleSet) {
        const rruleSet = rule as RRuleSet;
        const rules = rruleSet.rrules();
        if (rules.length > 0) {
          options = { ...rules[0].options };
        } else {
          return rruleString; // Return original if no rules found
        }
      } else {
        options = { ...rule.options };
      }

      // Set the new dtstart
      options.dtstart = newDtstart;

      // Create new RRule with updated options
      const newRule = new RRule(options);
      return newRule.toString();
    } catch (error) {
      console.error('Error updating DTSTART in rrule:', error);
      return rruleString; // Return original on error
    }
  };

  // Helper function to update frequency and until date in rrule
  const updateRruleFrequencyAndUntil = (
    rruleString: string,
    frequency: number,
    untilDate: Date
  ): string => {
    try {
      const rule = rrulestr(rruleString);
      let options: Partial<Options>;
      let hasExdates = false;
      let exdates: Date[] = [];

      if (rule instanceof RRuleSet) {
        const rruleSet = rule as RRuleSet;
        const rules = rruleSet.rrules();
        if (rules.length > 0) {
          options = { ...rules[0].options };
        } else {
          return rruleString; // Return original if no rules found
        }
        // Preserve EXDATEs if they exist
        exdates = rruleSet.exdates();
        hasExdates = exdates.length > 0;
      } else {
        options = { ...rule.options };
      }

      // Preserve dtstart (it should already be in options, but ensure it's set)
      const dtstart = options.dtstart;
      if (!dtstart) {
        console.error('No dtstart found in rrule');
        return rruleString;
      }

      // Update frequency and until date
      options.freq = frequency;
      options.until = untilDate;

      // Remove count if present (we're using until instead)
      delete options.count;

      // Handle byweekday based on frequency
      if (frequency === RRule.WEEKLY) {
        // For WEEKLY, set byweekday based on dtstart's day of the week
        // Map JavaScript getDay() (0=Sunday) to RRule constants
        const dayOfWeek = dtstart.getDay();
        const dayMap: ByWeekday[] = [
          RRule.SU, // 0 = Sunday
          RRule.MO, // 1 = Monday
          RRule.TU, // 2 = Tuesday
          RRule.WE, // 3 = Wednesday
          RRule.TH, // 4 = Thursday
          RRule.FR, // 5 = Friday
          RRule.SA, // 6 = Saturday
        ];
        options.byweekday = [dayMap[dayOfWeek]];
      } else if (frequency === RRule.DAILY) {
        // For DAILY, remove byweekday (not needed)
        delete options.byweekday;
      }

      // Ensure dtstart is preserved
      options.dtstart = dtstart;

      // Create new RRule with updated options
      const newRule = new RRule(options);

      // If there were EXDATEs, preserve them in an RRuleSet
      if (hasExdates) {
        const rruleSet = new RRuleSet();
        rruleSet.rrule(newRule);
        for (const exdate of exdates) {
          rruleSet.exdate(exdate);
        }
        return rruleSet.toString();
      }

      return newRule.toString();
    } catch (error) {
      console.error('Error updating frequency and UNTIL in rrule:', error);
      return rruleString; // Return original on error
    }
  };

  // Initialize form with mission data and schedules
  useEffect(() => {
    if (mission) {
      // Convert existing schedules to MissionScheduleSchema format
      const convertedSchedules: MissionScheduleSchema[] =
        existingSchedules && existingSchedules.length > 0
          ? existingSchedules.map(schedule => {
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

              // For existing schedules, use schedule times as availability times
              const availabilityStartAt = startAt;
              const availabilityEndAt = endAt;

              return {
                availabilityEndAt,
                availabilityStartAt,
                dtstart: dtstart ? dtstart.toISOString() : undefined,
                duration_mn: schedule.duration_mn,
                endAt,
                id: schedule.id,
                isAvailabilityRecurrent: isRecurrent,
                isRecurrent: !!until,
                missionId: missionId,
                rrule: schedule.rrule,
                scheduleId: schedule.id,
                startAt,
                until: until ? until.toISOString() : null,
              };
            })
          : [];

      // Reset form with all mission data including schedules
      form.reset({
        description: mission.description || '',
        is_draft: mission.status === 'draft',
        mission_dtstart: new Date(mission.mission_dtstart),
        mission_until: new Date(mission.mission_until),
        missionSchedules: convertedSchedules,
        professional_id: mission.professional_id,
        structure_id: mission.structure_id,
        title: mission.title,
      });
    }
  }, [existingSchedules, form, mission, missionId]);

  // Get selected professional from step 1
  const selectedProfessionalId = form.watch('professional_id');

  // Get mission dates from form to filter availabilities
  const missionStartDate = form.watch('mission_dtstart');
  const missionEndDate = form.watch('mission_until');

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

  // Filter slots to only include those within mission date range
  const filteredSlots = slots.filter(slot => {
    if (!missionStartDate || !missionEndDate) return true; // Show all if mission dates not set

    const slotStart = new Date(slot.startAt);
    const slotEnd = new Date(slot.endAt);
    const missionStart = new Date(missionStartDate);
    const missionEnd = new Date(missionEndDate);

    // Slot must start on or after mission start and end on or before mission end
    return slotStart >= missionStart && slotEnd <= missionEnd;
  });

  // Get availabilities to match with slots for rrule
  const { data: availabilitiesData } = useGetProfessionalAvailabilities(
    selectedProfessionalId || null
  );
  const availabilities = availabilitiesData?.data ?? [];

  const groupedSlots = useGroupedAvailabilitySlots(filteredSlots);

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

    // Validate slot is within mission date range
    const missionStart = missionStartDate ? new Date(missionStartDate) : null;
    const missionEnd = missionEndDate ? new Date(missionEndDate) : null;

    if (missionStart && missionEnd) {
      const slotStart = new Date(slot.startAt);
      const slotEnd = new Date(slot.endAt);

      if (slotStart < missionStart || slotEnd > missionEnd) {
        toast.error(
          t('slotOutsideMissionRange') ||
            'This availability slot is outside the mission date range'
        );
        return;
      }
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

    const dayOfWeek = start.getDay();
    // Map JavaScript getDay() (0=Sunday) to RRule constants
    const dayMap: ByWeekday[] = [
      RRule.SU, // 0 = Sunday
      RRule.MO, // 1 = Monday
      RRule.TU, // 2 = Tuesday
      RRule.WE, // 3 = Wednesday
      RRule.TH, // 4 = Thursday
      RRule.FR, // 5 = Friday
      RRule.SA, // 6 = Saturday
    ];

    const slotStartDate = new Date(slot.startAt);
    const rule = new RRule({
      byweekday: [dayMap[dayOfWeek]],
      dtstart: slotStartDate,
      freq: RRule.DAILY,
      until: undefined,
    });

    const data = {
      availabilityEndAt: slot.endAt,
      availabilityStartAt: slot.startAt,
      dtstart: slot.startAt,
      duration_mn: durationMn,
      endAt: slot.endAt,
      isAvailabilityRecurrent: isAvailabilityRecurrent,
      isRecurrent: false,
      missionId: missionId,
      rrule: rule.toString(),
      startAt: slot.startAt,
      until: null,
    };

    append(data);
  };

  const handleSubmit = async (data: EditMissionFormData) => {
    if (!mission) {
      toast.error(t('missionNotFound'));
      return;
    }

    if (!data.mission_until) {
      toast.error(t('missionEndDateRequired'));
      return;
    }

    // Validate all schedules before submission
    const missionStart = new Date(data.mission_dtstart);
    const missionEnd = new Date(data.mission_until);

    if (data.missionSchedules && data.missionSchedules.length > 0) {
      for (const schedule of data.missionSchedules) {
        if (!schedule.startAt || !schedule.endAt) {
          toast.error(t('scheduleMissingTimes'));
          return;
        }

        const startDate = new Date(schedule.startAt);
        const endDate = new Date(schedule.endAt);
        const availabilityStart = new Date(schedule.availabilityStartAt);
        const availabilityEnd = new Date(schedule.availabilityEndAt);

        // Validate: end time must be after start time
        if (endDate <= startDate) {
          toast.error(t('scheduleEndBeforeStart'));
          return;
        }

        // Validate: start time must be within availability range
        if (startDate < availabilityStart || startDate > availabilityEnd) {
          toast.error(t('scheduleStartOutOfRange'));
          return;
        }

        // Validate: end time must be within availability range
        if (endDate < availabilityStart || endDate > availabilityEnd) {
          toast.error(t('scheduleEndOutOfRange'));
          return;
        }

        // Validate: schedule must be within mission date range
        if (startDate < missionStart || endDate > missionEnd) {
          toast.error(
            t('scheduleOutsideMissionRange') ||
              'Schedule must be within the mission date range'
          );
          return;
        }

        // Validate: recurring schedules must have UNTIL set to mission end date
        if (schedule.isRecurrent) {
          if (!schedule.rrule.includes('UNTIL=')) {
            // This will be set in the processing below, but validate the pattern
            const untilDate = new Date(data.mission_until);
            const rruleWithUntil = setRruleUntil(schedule.rrule, untilDate);
            if (!rruleWithUntil.includes('UNTIL=')) {
              toast.error(
                t('recurrentScheduleUntilRequired') ||
                  'Recurring schedules must have UNTIL set to mission end date'
              );
              return;
            }
          }
        }
      }
    }

    try {
      // Determine new status
      const newStatus = data.is_draft
        ? 'draft'
        : mission.status === 'draft'
          ? 'pending'
          : mission.status;

      // Process schedules: separate into create, update, and delete
      const existingScheduleIds = new Set(
        existingSchedules?.map(s => s.id) || []
      );
      const formScheduleIds = new Set(
        (data.missionSchedules || [])
          .map(s => s.scheduleId || s.id)
          .filter((id): id is string => !!id)
      );

      // Schedules to delete (exist in DB but not in form)
      const scheduleIdsToDelete = Array.from(existingScheduleIds).filter(
        id => !formScheduleIds.has(id)
      );

      // Helper function to ensure UNTIL is set for recurring rrules
      const ensureRruleUntil = (
        rrule: string,
        missionEndDate: Date
      ): string => {
        // Check if rrule is recurring (has FREQ)
        const isRecurring =
          rrule.includes('FREQ=WEEKLY') ||
          rrule.includes('FREQ=DAILY') ||
          rrule.includes('FREQ=MONTHLY') ||
          rrule.includes('FREQ=YEARLY');

        if (isRecurring) {
          // Always set UNTIL to mission end date for recurring schedules
          return setRruleUntil(rrule, missionEndDate);
        }
        return rrule;
      };

      const missionEndDate = new Date(data.mission_until);

      // Schedules to update (exist in both)
      const schedulesToUpdate = (data.missionSchedules || [])
        .filter(s => s.scheduleId || s.id)
        .map(schedule => {
          const scheduleId = schedule.scheduleId || schedule.id!;
          // Ensure UNTIL is set for recurring rrules
          const rrule = ensureRruleUntil(schedule.rrule, missionEndDate);
          return {
            duration_mn: schedule.duration_mn,
            id: scheduleId,
            rrule: rrule,
          };
        });

      // Schedules to create (new ones without scheduleId or id)
      const schedulesToCreate = (data.missionSchedules || [])
        .filter(s => !s.scheduleId && !s.id)
        .map(schedule => {
          // Ensure UNTIL is set for recurring rrules
          const rrule = ensureRruleUntil(schedule.rrule, missionEndDate);
          return {
            duration_mn: schedule.duration_mn,
            rrule: rrule,
          };
        });

      // Update mission with all data through Edge Function
      await updateMission.mutateAsync({
        missionId: mission.id,
        updateData: {
          description: data.description || null,
          mission_dtstart: new Date(data.mission_dtstart).toISOString(),
          mission_until: new Date(data.mission_until).toISOString(),
          schedules: {
            create: schedulesToCreate.length > 0 ? schedulesToCreate : [],
            delete: scheduleIdsToDelete.length > 0 ? scheduleIdsToDelete : [],
            update: schedulesToUpdate.length > 0 ? schedulesToUpdate : [],
          },
          status: newStatus as Database['public']['Enums']['mission_status'],
          title: data.title,
        },
      });

      toast.success(t('updateSuccess'));
      router.push('/structure/missions');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(t('updateError'));
    }
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
    <div className='min-h-screen space-y-4 bg-blue-50/30 p-3 sm:space-y-6 sm:p-4 md:p-6 lg:space-y-8 lg:p-8'>
      <div className='flex items-center gap-2 sm:gap-3'>
        <Link className='flex-shrink-0' href='/structure/missions'>
          <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 transition-colors hover:text-gray-800 sm:h-6 sm:w-6' />
        </Link>
        <h1 className='truncate text-lg font-bold text-gray-800 sm:text-xl md:text-2xl lg:text-3xl'>
          {canEdit
            ? t('editMission') || 'Edit Mission'
            : t('viewMission') || 'View Mission'}
        </h1>
      </div>

      {!canEdit && (
        <Card className='rounded-lg border border-orange-200 bg-orange-50 p-3 sm:p-4'>
          <div className='flex items-start gap-2 text-orange-800 sm:items-center'>
            <Lock className='mt-0.5 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5' />
            <p className='text-xs font-medium leading-relaxed sm:text-sm'>
              {t('missionReadOnly') ||
                'This mission cannot be edited because it is not in pending or draft status.'}
            </p>
          </div>
        </Card>
      )}

      {canEdit && (
        <div className='space-y-2 sm:space-y-3'>
          <div className='flex items-center gap-1.5 sm:gap-2 md:gap-3'>
            <div className='flex flex-col items-center gap-0.5 sm:gap-1'>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-9 sm:w-9 sm:text-sm ${
                  step >= 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <span
                className={`hidden text-[10px] font-medium leading-tight sm:block sm:text-xs md:text-sm ${
                  step >= 1 ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {t('step1Title') || 'Mission Information'}
              </span>
            </div>
            <div className='h-1 flex-1 rounded-full bg-gray-200'>
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  step >= 2 ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                style={{ width: step >= 2 ? '100%' : '0%' }}
              />
            </div>
            <div className='flex flex-col items-center gap-0.5 sm:gap-1'>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-9 sm:w-9 sm:text-sm ${
                  step >= 2
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <span
                className={`hidden text-[10px] font-medium leading-tight sm:block sm:text-xs md:text-sm ${
                  step >= 2 ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {t('step2Title') || 'Select Availabilities'}
              </span>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {step === 1 ? (
            <div className='space-y-4 rounded-lg border bg-white p-3 shadow-sm sm:space-y-5 sm:p-4 md:space-y-6 md:p-6 lg:p-8'>
              {canEdit ? (
                <div className='space-y-4 sm:space-y-5 md:space-y-6'>
                  {/* Status Badge */}
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3',
                      status.bgColor,
                      status.textColor
                    )}
                  >
                    <div
                      className={cn('h-2 w-2 rounded-full', status.dotColor)}
                    />
                    <span className='text-xs font-medium sm:text-sm'>
                      {status.label}
                    </span>
                  </div>

                  {/* Title */}
                  <FormField
                    control={control}
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
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-gray-700 sm:text-base'>
                      {t('selectProfessional') || 'Select Professional'}
                    </label>
                    {selectedProfessional ? (
                      <div className='flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 sm:gap-3 sm:p-3'>
                        <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 sm:h-12 sm:w-12'>
                          {selectedProfessional.avatarUrl ? (
                            <Image
                              alt={selectedProfessional.name}
                              className='h-full w-full object-cover'
                              height={48}
                              src={selectedProfessional.avatarUrl}
                              unoptimized
                              width={48}
                            />
                          ) : (
                            <span className='text-sm font-semibold text-gray-500 sm:text-base'>
                              {selectedProfessional.name
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className='min-w-0 flex-1 text-left'>
                          <div className='truncate text-sm font-medium text-gray-900 sm:text-base'>
                            {selectedProfessional.name}
                          </div>
                          {selectedProfessional.location && (
                            <div className='truncate text-xs text-gray-500 sm:text-sm'>
                              {selectedProfessional.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm text-gray-500 sm:text-base'>
                        {t('noProfessional') || 'No professional selected'}
                      </p>
                    )}
                  </div>

                  {/* Mission Start Date */}
                  <FormField
                    control={control}
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
                    control={control}
                    name='mission_until'
                    render={({ field }) => {
                      const startDate = getValues('mission_dtstart');
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
                    control={control}
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
                    control={control}
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
                  <div className='mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3'>
                    <Button
                      className='h-10 w-full text-sm sm:h-9 sm:w-auto sm:px-4'
                      onClick={() => router.push('/structure/missions')}
                      type='button'
                      variant='outline'
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      className='h-10 w-full bg-blue-500 text-sm text-white transition-colors hover:bg-blue-600 sm:h-9 sm:w-auto sm:px-4'
                      disabled={updateMission.isPending}
                      onClick={() => setStep(2)}
                      type='button'
                    >
                      {t('next')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-4 sm:space-y-5 md:space-y-6'>
                  {/* Status Badge */}
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3',
                      status.bgColor,
                      status.textColor
                    )}
                  >
                    <div
                      className={cn('h-2 w-2 rounded-full', status.dotColor)}
                    />
                    <span className='text-xs font-medium sm:text-sm'>
                      {status.label}
                    </span>
                  </div>

                  {/* Read-only fields */}
                  <div className='space-y-4 sm:space-y-5'>
                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-gray-700 sm:text-base'>
                        {t('title') || 'Title'}
                      </label>
                      <p className='text-sm text-gray-900 sm:text-base'>
                        {mission.title}
                      </p>
                    </div>

                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-gray-700 sm:text-base'>
                        {t('missionStartDate') || 'Mission Start Date'}
                      </label>
                      <p className='text-sm text-gray-900 sm:text-base'>
                        {format(new Date(mission.mission_dtstart), 'PPpp')}
                      </p>
                    </div>

                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-gray-700 sm:text-base'>
                        {t('missionEndDate') || 'Mission End Date'}
                      </label>
                      <p className='text-sm text-gray-900 sm:text-base'>
                        {format(new Date(mission.mission_until), 'PPpp')}
                      </p>
                    </div>

                    {mission.description && (
                      <div className='space-y-1.5'>
                        <label className='block text-sm font-medium text-gray-700 sm:text-base'>
                          {t('description') || 'Description'}
                        </label>
                        <p className='whitespace-pre-wrap text-sm text-gray-900 sm:text-base'>
                          {mission.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Back Button */}
                  <div className='flex justify-end pt-2'>
                    <Button
                      className='h-10 w-full text-sm sm:h-9 sm:w-auto sm:px-4'
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
            <div className='space-y-4 sm:space-y-5 md:space-y-6'>
              {/* Availability Calendar */}
              <div className='space-y-3 sm:space-y-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-base font-bold text-gray-800 sm:text-lg md:text-xl'>
                    {t('selectAvailabilities') || 'Select Availabilities'}
                  </h2>
                </div>

                {/* Weekly Navigation */}
                <div className='rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3 md:p-4'>
                  <div className='mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3 md:gap-4'>
                    <Button
                      className='h-9 px-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 sm:px-3'
                      onClick={goToPreviousWeek}
                      size='sm'
                      type='button'
                      variant='ghost'
                    >
                      <ChevronLeft className='h-4 w-4 sm:mr-1 sm:h-5 sm:w-5' />
                      <span className='hidden text-xs sm:inline sm:text-sm'>
                        {t('previousWeek')}
                      </span>
                    </Button>
                    <h3 className='flex-1 text-center text-xs font-bold text-blue-900 sm:text-sm md:text-base lg:text-lg'>
                      <span className='hidden sm:inline'>
                        {t('weekOf')}{' '}
                        {mounted && format(weekStart, 'd MMMM yyyy')}
                      </span>
                      <span className='sm:hidden'>
                        {mounted && format(weekStart, 'd MMM yyyy')}
                      </span>
                    </h3>
                    <Button
                      className='h-9 px-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 sm:px-3'
                      onClick={goToNextWeek}
                      size='sm'
                      type='button'
                      variant='ghost'
                    >
                      <span className='hidden text-xs sm:inline sm:text-sm'>
                        {t('nextWeek')}
                      </span>
                      <ChevronRight className='h-4 w-4 sm:ml-1 sm:h-5 sm:w-5' />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-7'>
                    {weekDays.map((day, index) => {
                      const isToday = mounted && isSameDay(day, new Date());
                      const dayName = dayNames[index];
                      const dayNumber = format(day, 'd');
                      const month = format(day, 'MMM');
                      const daySlots = groupedSlots.getSlotsByDay(day);

                      return (
                        <Card
                          className={`min-h-[140px] rounded-lg border-2 bg-white shadow-sm transition-shadow hover:shadow-md sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] ${
                            isToday
                              ? 'border-blue-500 bg-blue-50/50'
                              : 'border-gray-200'
                          }`}
                          key={index}
                        >
                          <div className='p-2 sm:p-2.5 md:p-3'>
                            <div className='mb-1 text-xs font-bold text-blue-900 sm:text-sm'>
                              {dayName}
                            </div>
                            <div className='mb-2 text-xs text-blue-900 sm:mb-3 sm:text-sm'>
                              {dayNumber} {month}
                            </div>
                            <div className='space-y-1.5 sm:space-y-2'>
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
                                    <TooltipProvider key={slotIndex}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            className='h-8 w-full justify-start border border-green-300 bg-green-50 px-2 text-[10px] text-green-700 transition-colors hover:bg-green-100 sm:h-9 sm:px-2.5 sm:text-xs md:text-sm'
                                            onClick={() =>
                                              handleAddSchedule(slot)
                                            }
                                            size='sm'
                                            type='button'
                                          >
                                            <Plus className='h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5' />
                                            <span className='truncate'>
                                              {startTime} - {endTime}
                                            </span>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <span className='truncate'>
                                            {startTime} - {endTime}
                                          </span>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              {daySlots.filter(slot => slot.isAvailable)
                                .length === 0 && (
                                <div className='py-2 text-center text-[10px] text-gray-400 sm:py-3 sm:text-xs'>
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
                  <h3 className='text-base font-bold text-gray-800 sm:text-lg md:text-xl'>
                    {t('selectedSchedules')}
                  </h3>
                  <div className='space-y-2.5 sm:space-y-3'>
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
                      // Minimum end time is 1 minute after start time
                      const minEndDate = new Date(currentStart);
                      minEndDate.setMinutes(minEndDate.getMinutes() + 1);

                      const minStartTime = format(
                        availabilityStart,
                        "yyyy-MM-dd'T'HH:mm"
                      );
                      const maxStartTime = format(
                        availabilityEnd,
                        "yyyy-MM-dd'T'HH:mm"
                      );
                      const minEndTime = format(
                        minEndDate,
                        "yyyy-MM-dd'T'HH:mm"
                      );
                      const maxEndTime = format(
                        availabilityEnd,
                        "yyyy-MM-dd'T'HH:mm"
                      );

                      return (
                        <Card
                          className='border-gray-200 p-3 shadow-sm sm:p-4'
                          key={field.id}
                        >
                          <div className='flex items-start justify-between gap-2.5 sm:gap-3 md:gap-4'>
                            <div className='min-w-0 flex-1 space-y-3 sm:space-y-4'>
                              <div className='space-y-1'>
                                <div className='text-sm font-semibold text-gray-900 sm:text-base'>
                                  <span className='hidden sm:inline'>
                                    {format(
                                      new Date(field.startAt),
                                      'EEEE, d MMMM yyyy'
                                    )}
                                  </span>
                                  <span className='sm:hidden'>
                                    {format(
                                      new Date(field.startAt),
                                      'EEE, d MMM yyyy'
                                    )}
                                  </span>
                                </div>
                                <div className='text-xs text-gray-500 sm:text-sm'>
                                  {t('availabilityRange')}: {t('from')}{' '}
                                  {availabilityStartTime} {t('to')}{' '}
                                  {availabilityEndTime}
                                </div>
                              </div>

                              {/* Start Time Picker */}
                              <FormField
                                control={control}
                                name={`missionSchedules.${index}.startAt`}
                                render={({ field: startField }) => {
                                  const startAtValue = startField.value
                                    ? new Date(startField.value)
                                    : null;
                                  const isOutOfRange =
                                    startAtValue &&
                                    (startAtValue < availabilityStart ||
                                      startAtValue > availabilityEnd);

                                  return (
                                    <FormItem>
                                      <FormLabel className='text-xs sm:text-sm'>
                                        {t('scheduleStartTime')}
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          className={cn(
                                            'h-9 text-xs sm:h-10 sm:text-sm',
                                            isOutOfRange &&
                                              'border-red-500 focus-visible:ring-red-500'
                                          )}
                                          max={maxStartTime}
                                          min={minStartTime}
                                          onChange={e => {
                                            if (!e.target.value) {
                                              startField.onChange('');
                                              return;
                                            }

                                            const newStart = new Date(
                                              e.target.value
                                            );

                                            // Validate: start time must be within availability range
                                            if (newStart < availabilityStart) {
                                              toast.error(
                                                t(
                                                  'startTimeBeforeAvailability'
                                                ) ||
                                                  'Start time cannot be before the availability start time'
                                              );
                                              return;
                                            }

                                            if (newStart > availabilityEnd) {
                                              toast.error(
                                                t(
                                                  'startTimeAfterAvailability'
                                                ) ||
                                                  'Start time cannot be after the availability end time'
                                              );
                                              return;
                                            }

                                            startField.onChange(
                                              newStart.toISOString()
                                            );

                                            const endAtValue = getValues(
                                              `missionSchedules.${index}.endAt`
                                            );
                                            const currentEndDate = endAtValue
                                              ? new Date(endAtValue)
                                              : availabilityEnd;

                                            // Ensure end time is always after start time
                                            let finalEndDate = currentEndDate;
                                            if (currentEndDate <= newStart) {
                                              const newEnd = new Date(newStart);
                                              newEnd.setMinutes(
                                                newEnd.getMinutes() + 1
                                              );
                                              // Ensure new end time is within availability range
                                              if (newEnd > availabilityEnd) {
                                                finalEndDate = availabilityEnd;
                                                setValue(
                                                  `missionSchedules.${index}.endAt`,
                                                  availabilityEnd.toISOString()
                                                );
                                              } else {
                                                finalEndDate = newEnd;
                                                setValue(
                                                  `missionSchedules.${index}.endAt`,
                                                  newEnd.toISOString()
                                                );
                                              }
                                            } else if (
                                              currentEndDate > availabilityEnd
                                            ) {
                                              // If end time is out of range, clamp it
                                              finalEndDate = availabilityEnd;
                                              setValue(
                                                `missionSchedules.${index}.endAt`,
                                                availabilityEnd.toISOString()
                                              );
                                            }

                                            const durationMn = Math.round(
                                              (finalEndDate.getTime() -
                                                newStart.getTime()) /
                                                60000
                                            );
                                            setValue(
                                              `missionSchedules.${index}.duration_mn`,
                                              durationMn
                                            );
                                            setValue(
                                              `missionSchedules.${index}.dtstart`,
                                              newStart.toISOString()
                                            );

                                            // Update rrule dtstart
                                            const currentRrule = getValues(
                                              `missionSchedules.${index}.rrule`
                                            );
                                            if (currentRrule) {
                                              const updatedRrule =
                                                updateRruleDtstart(
                                                  currentRrule,
                                                  newStart
                                                );
                                              setValue(
                                                `missionSchedules.${index}.rrule`,
                                                updatedRrule
                                              );
                                            }
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
                                      {isOutOfRange && (
                                        <p className='text-xs text-red-600 sm:text-sm'>
                                          {t('startTimeOutOfRange') ||
                                            'Start time must be within the availability range'}
                                        </p>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />

                              {/* End Time Picker */}
                              <FormField
                                control={control}
                                name={`missionSchedules.${index}.endAt`}
                                render={({ field: endField }) => {
                                  const endAtValue = endField.value
                                    ? new Date(endField.value)
                                    : null;
                                  const startAtValue = watch(
                                    `missionSchedules.${index}.startAt`
                                  ) as string | undefined;
                                  const startDate = startAtValue
                                    ? new Date(startAtValue)
                                    : availabilityStart;

                                  const isBeforeStart =
                                    endAtValue && endAtValue <= startDate;
                                  const isOutOfRange =
                                    endAtValue &&
                                    (endAtValue < availabilityStart ||
                                      endAtValue > availabilityEnd);

                                  return (
                                    <FormItem>
                                      <FormLabel className='text-xs sm:text-sm'>
                                        {t('scheduleEndTime')}
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          className={cn(
                                            'h-9 text-xs sm:h-10 sm:text-sm',
                                            (isBeforeStart || isOutOfRange) &&
                                              'border-red-500 focus-visible:ring-red-500'
                                          )}
                                          max={maxEndTime}
                                          min={minEndTime}
                                          onChange={e => {
                                            if (!e.target.value) {
                                              endField.onChange('');
                                              return;
                                            }

                                            const newEnd = new Date(
                                              e.target.value
                                            );

                                            // Validate: end time must be after start time
                                            if (newEnd <= startDate) {
                                              toast.error(
                                                t('endTimeBeforeStart') ||
                                                  'End time must be after the start time'
                                              );
                                              // Auto-adjust to 1 minute after start
                                              const adjustedEnd = new Date(
                                                startDate
                                              );
                                              adjustedEnd.setMinutes(
                                                adjustedEnd.getMinutes() + 1
                                              );
                                              // Ensure adjusted time is within availability range
                                              if (
                                                adjustedEnd > availabilityEnd
                                              ) {
                                                toast.error(
                                                  t('endTimeOutOfRange') ||
                                                    'End time cannot be set within the availability range. Please adjust the start time.'
                                                );
                                                return;
                                              }
                                              endField.onChange(
                                                adjustedEnd.toISOString()
                                              );
                                              const durationMn = Math.round(
                                                (adjustedEnd.getTime() -
                                                  startDate.getTime()) /
                                                  60000
                                              );
                                              setValue(
                                                `missionSchedules.${index}.duration_mn`,
                                                durationMn
                                              );
                                              return;
                                            }

                                            // Validate: end time must be within availability range
                                            if (newEnd < availabilityStart) {
                                              toast.error(
                                                t(
                                                  'endTimeBeforeAvailability'
                                                ) ||
                                                  'End time cannot be before the availability start time'
                                              );
                                              return;
                                            }

                                            if (newEnd > availabilityEnd) {
                                              toast.error(
                                                t('endTimeAfterAvailability') ||
                                                  'End time cannot be after the availability end time'
                                              );
                                              // Auto-clamp to availability end
                                              endField.onChange(
                                                availabilityEnd.toISOString()
                                              );
                                              const durationMn = Math.round(
                                                (availabilityEnd.getTime() -
                                                  startDate.getTime()) /
                                                  60000
                                              );
                                              setValue(
                                                `missionSchedules.${index}.duration_mn`,
                                                durationMn
                                              );
                                              return;
                                            }

                                            endField.onChange(
                                              newEnd.toISOString()
                                            );

                                            const durationMn = Math.round(
                                              (newEnd.getTime() -
                                                startDate.getTime()) /
                                                60000
                                            );
                                            setValue(
                                              `missionSchedules.${index}.duration_mn`,
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
                                      {isBeforeStart && (
                                        <p className='text-xs text-red-600 sm:text-sm'>
                                          {t('endTimeBeforeStartError') ||
                                            'End time must be after the start time'}
                                        </p>
                                      )}
                                      {isOutOfRange && !isBeforeStart && (
                                        <p className='text-xs text-red-600 sm:text-sm'>
                                          {t('endTimeOutOfRangeError') ||
                                            'End time must be within the availability range'}
                                        </p>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />

                              {(() => {
                                const startAt = watch(
                                  `missionSchedules.${index}.startAt`
                                ) as string | undefined;
                                const endAt = watch(
                                  `missionSchedules.${index}.endAt`
                                ) as string | undefined;
                                const durationMn =
                                  startAt && endAt
                                    ? Math.round(
                                        (new Date(endAt).getTime() -
                                          new Date(startAt).getTime()) /
                                          60000
                                      )
                                    : field.duration_mn || 0;
                                return (
                                  <div className='text-xs text-gray-500 sm:text-sm'>
                                    {t('duration')}:{' '}
                                    {Math.floor(durationMn / 60)}h{' '}
                                    {durationMn % 60}min
                                  </div>
                                );
                              })()}

                              {/* Recurrent Checkbox */}
                              <FormField
                                control={control}
                                name={`missionSchedules.${index}.isRecurrent`}
                                render={({ field: checkboxField }) => (
                                  <FormItem className='flex flex-row items-start space-x-2.5 space-y-0 sm:space-x-3'>
                                    <FormControl>
                                      <Checkbox
                                        checked={checkboxField.value as boolean}
                                        className='mt-0.5'
                                        disabled={
                                          !field.isAvailabilityRecurrent
                                        }
                                        onCheckedChange={checked => {
                                          checkboxField.onChange(checked);

                                          // Update rrule frequency and until date
                                          const currentRrule = getValues(
                                            `missionSchedules.${index}.rrule`
                                          );
                                          if (currentRrule) {
                                            const isRecurrent =
                                              checked === true;
                                            const frequency = isRecurrent
                                              ? RRule.WEEKLY
                                              : RRule.DAILY;

                                            // Get mission end date
                                            const missionUntil =
                                              getValues('mission_until');
                                            if (!missionUntil) return;

                                            // Get schedule end time
                                            const endAt = getValues(
                                              `missionSchedules.${index}.endAt`
                                            );
                                            if (!endAt) return;

                                            const endAtDate = new Date(endAt);
                                            const missionEndDate = new Date(
                                              missionUntil
                                            );

                                            // Create until date: mission end date with schedule end time
                                            const untilDate = new Date(
                                              missionEndDate
                                            );
                                            untilDate.setHours(
                                              endAtDate.getHours(),
                                              endAtDate.getMinutes(),
                                              endAtDate.getSeconds(),
                                              endAtDate.getMilliseconds()
                                            );

                                            const updatedRrule =
                                              updateRruleFrequencyAndUntil(
                                                currentRrule,
                                                frequency,
                                                untilDate
                                              );
                                            setValue(
                                              `missionSchedules.${index}.rrule`,
                                              updatedRrule
                                            );
                                            setValue(
                                              `missionSchedules.${index}.until`,
                                              untilDate.toISOString()
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <div className='space-y-0.5 leading-none sm:space-y-1'>
                                      <FormLabel
                                        className={`cursor-pointer text-xs font-normal sm:text-sm ${
                                          !field.isAvailabilityRecurrent
                                            ? 'text-gray-400'
                                            : 'text-gray-700'
                                        }`}
                                      >
                                        {t('recurrent') || 'Recurrent'}
                                      </FormLabel>
                                      <FormDescription className='text-[10px] leading-relaxed sm:text-xs'>
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
                              className='h-9 w-9 flex-shrink-0 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 sm:h-10 sm:w-10'
                              onClick={() => remove(index)}
                              size='sm'
                              type='button'
                              variant='ghost'
                            >
                              <Trash2 className='h-4 w-4 sm:h-5 sm:w-5' />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className='mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3'>
                <Button
                  className='h-10 w-full text-sm sm:h-9 sm:w-auto sm:px-4'
                  onClick={() => setStep(1)}
                  type='button'
                  variant='outline'
                >
                  {t('back')}
                </Button>
                <Button
                  className='h-10 w-full bg-blue-500 text-sm text-white transition-colors hover:bg-blue-600 sm:h-9 sm:w-auto sm:px-4'
                  disabled={updateMission.isPending || fields.length === 0}
                  type='submit'
                >
                  {updateMission.isPending ? t('updating') : t('update')}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
