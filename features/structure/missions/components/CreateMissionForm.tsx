'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formatISO } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { useCreateMission } from '@/features/missions/hooks/useCreateMission';
import { Link } from '@/i18n/routing';

import { useGetProfessionals } from '../../professionals/hooks/useGetProfessionals';
import { useGetProfessionalAvailabilities } from '../hooks/useGetProfessionalAvailabilities';
import {
  type MissionFormData,
  missionFormSchema,
} from '../schemas/mission.schema';

export function CreateMissionForm() {
  const t = useTranslations('structure.missions');
  const router = useRouter();
  const { data: session } = useSession();
  const structureId = session?.user?.id;

  const { data: professionalsData } = useGetProfessionals();
  const professionals = professionalsData?.data ?? [];

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    null | string
  >(null);

  const { data: availabilitiesData } = useGetProfessionalAvailabilities(
    selectedProfessionalId
  );
  const availabilities = availabilitiesData?.data ?? [];

  const form = useForm<MissionFormData>({
    defaultValues: {
      description: '',
      mission_dtstart: undefined,
      mission_until: undefined,
      professional_id: '',
      schedule_id: '',
      structure_id: structureId || '',
      title: '',
    },
    resolver: zodResolver(missionFormSchema),
  });

  const { isPending, mutate: createMission } = useCreateMission();

  useEffect(() => {
    if (structureId) {
      form.setValue('structure_id', structureId);
    }
  }, [structureId, form]);

  const onSubmit = (data: MissionFormData) => {
    if (!structureId) {
      toast.error('Structure ID is required');
      return;
    }

    // Find selected availability
    const selectedAvailability = availabilities.find(
      avail => avail.id === data.schedule_id
    );

    if (!selectedAvailability) {
      toast.error('Please select an availability');
      return;
    }

    // Create mission with schedule from availability
    createMission(
      {
        description: data.description,
        mission_dtstart: formatISO(data.mission_dtstart),
        mission_until: formatISO(data.mission_until),
        professional_id: data.professional_id,
        schedules: [
          {
            duration_mn: selectedAvailability.duration_mn,
            rrule: selectedAvailability.rrule,
          },
        ],
        structure_id: structureId,
        title: data.title,
      },
      {
        onError: error => {
          toast.error(
            error instanceof Error
              ? error.message
              : t('createError') || 'Failed to create mission'
          );
        },
        onSuccess: () => {
          toast.success(t('createSuccess') || 'Mission created successfully');
          router.push('/structure/missions');
        },
      }
    );
  };

  const handleProfessionalChange = (professionalId: string) => {
    setSelectedProfessionalId(professionalId);
    form.setValue('professional_id', professionalId);
    form.setValue('schedule_id', ''); // Reset schedule selection
  };

  // Format availability for display
  const formatAvailability = (rrule: string, durationMn: number) => {
    // Simple formatting - can be enhanced
    const hours = Math.floor(durationMn / 60);
    const minutes = durationMn % 60;
    const duration =
      hours > 0
        ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
        : `${minutes}min`;

    // Extract day and time from RRULE if possible
    const dayMatch = rrule.match(/BYDAY=([A-Z]{2})/);
    const timeMatch = rrule.match(/T(\d{2})(\d{2})/);

    let display = '';
    if (dayMatch) {
      const days: Record<string, string> = {
        FR: 'Friday',
        MO: 'Monday',
        SA: 'Saturday',
        SU: 'Sunday',
        TH: 'Thursday',
        TU: 'Tuesday',
        WE: 'Wednesday',
      };
      display = days[dayMatch[1]] || dayMatch[1];
    }
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2], 10);
      display += ` ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    return display ? `${display} (${duration})` : `RRULE (${duration})`;
  };

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

      <Card className='p-8'>
        <Form {...form}>
          <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
            {/* Title */}
            <FormField
              control={form.control}
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
              control={form.control}
              name='professional_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('selectProfessional') || 'Select Professional'}
                  </FormLabel>
                  <Select
                    onValueChange={handleProfessionalChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            t('selectProfessionalPlaceholder') ||
                            'Select a professional'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map(professional => (
                        <SelectItem
                          key={professional.id}
                          value={professional.id}
                        >
                          {professional.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability Selection - Only show if professional is selected */}
            {selectedProfessionalId && (
              <FormField
                control={form.control}
                name='schedule_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('selectAvailability') || 'Select Availability'}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              t('selectAvailabilityPlaceholder') ||
                              'Select an availability'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availabilities.length === 0 ? (
                          <SelectItem disabled value='no-availabilities'>
                            {t('noAvailabilities') || 'No availabilities found'}
                          </SelectItem>
                        ) : (
                          availabilities.map(availability => (
                            <SelectItem
                              key={availability.id}
                              value={availability.id}
                            >
                              {formatAvailability(
                                availability.rrule,
                                availability.duration_mn
                              )}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('availabilityDescription') ||
                        'Select the professional availability for this mission'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Mission Start Date */}
            <FormField
              control={form.control}
              name='mission_dtstart'
              render={({ field }) => (
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
                          ? new Date(field.value).toISOString().slice(0, 16)
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
              control={form.control}
              name='mission_until'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('missionEndDate') || 'Mission End Date'}
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
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
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
              <Button disabled={isPending} type='submit'>
                {isPending
                  ? t('creating') || 'Creating...'
                  : t('create') || 'Create Mission'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
