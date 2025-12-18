'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formatISO } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
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
              render={({ field }) => {
                const selectedProfessional = professionals.find(
                  p => p.id === field.value
                );

                return (
                  <FormItem>
                    <FormLabel>
                      {t('selectProfessional') || 'Select Professional'}
                    </FormLabel>
                    <Select
                      onValueChange={handleProfessionalChange}
                      value={field.value}
                    >
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
                );
              }}
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
              <Button
                className='bg-blue-500 text-white hover:bg-blue-600'
                disabled={isPending}
                type='submit'
              >
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
