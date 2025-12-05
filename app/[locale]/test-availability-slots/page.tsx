'use client';

import { format } from 'date-fns';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFindAvailabilitySlots } from '@/features/availabilities/hooks/useFindAvailabilitySlots';
import { useGroupedAvailabilitySlots } from '@/features/availabilities/hooks/useGroupedAvailabilitySlots';
import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';

const convertDatetimeLocalToISO = (datetimeLocal: string): string => {
  if (!datetimeLocal) return '';
  const date = new Date(datetimeLocal);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
};

export default function TestAvailabilitySlotsPage() {
  const [professionalId, setProfessionalId] = useState('');
  const [startAtLocal, setStartAtLocal] = useState('');
  const [endAtLocal, setEndAtLocal] = useState('');
  const [testDateLocal, setTestDateLocal] = useState('');

  const { data: professionalsData } = useFindProfessionals({}, { limit: 100 });

  const startAt = convertDatetimeLocalToISO(startAtLocal);
  const endAt = convertDatetimeLocalToISO(endAtLocal);

  const { data, error, isFetching, isLoading } = useFindAvailabilitySlots({
    endAt,
    professionalId,
    startAt,
  });

  const { getSlotsByDay, slotsByDay } = useGroupedAvailabilitySlots(data ?? []);

  const testDate = testDateLocal
    ? convertDatetimeLocalToISO(testDateLocal)
    : null;
  const slotsForTestDate = testDate ? getSlotsByDay(testDate) : [];

  return (
    <div className='container mx-auto p-6'>
      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle>Test Availability Slots Hook</CardTitle>
          <CardDescription>
            Enter the required filters to test the useFindAvailabilitySlots hook
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='professionalId'>Professional</Label>
            <Select onValueChange={setProfessionalId} value={professionalId}>
              <SelectTrigger id='professionalId'>
                <SelectValue placeholder='Select a professional' />
              </SelectTrigger>
              <SelectContent>
                {professionalsData?.data?.map(professional => (
                  <SelectItem
                    key={professional.user_id}
                    value={professional.user_id}
                  >
                    {professional.profile?.first_name}{' '}
                    {professional.profile?.last_name} ({professional.user_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='startAt'>Start At</Label>
            <Input
              id='startAt'
              onChange={e => setStartAtLocal(e.target.value)}
              type='datetime-local'
              value={startAtLocal}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='endAt'>End At</Label>
            <Input
              id='endAt'
              onChange={e => setEndAtLocal(e.target.value)}
              type='datetime-local'
              value={endAtLocal}
            />
          </div>

          <div className='pt-4'>
            <div className='mb-4 space-y-2'>
              <div className='text-sm font-medium'>Query Status:</div>
              <div className='text-sm text-muted-foreground'>
                {isLoading && 'Loading...'}
                {isFetching && !isLoading && 'Fetching...'}
                {!isLoading && !isFetching && 'Idle'}
                {error && (
                  <span className='text-destructive'>
                    {' '}
                    - Error: {error.message}
                  </span>
                )}
              </div>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='text-sm font-medium'>Raw Results:</div>
                {data && data.length > 0 ? (
                  <div className='space-y-2'>
                    <div className='text-sm text-muted-foreground'>
                      Found {data.length} slot(s)
                    </div>
                    <div className='rounded-md border p-4'>
                      <pre className='overflow-auto text-xs'>
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className='text-sm text-muted-foreground'>
                    {!professionalId || !startAtLocal || !endAtLocal
                      ? 'Fill in all fields to enable the query'
                      : 'No slots found'}
                  </div>
                )}
              </div>

              {data && data.length > 0 && (
                <>
                  <div className='space-y-2'>
                    <div className='text-sm font-medium'>
                      Grouped by Day ({Object.keys(slotsByDay).length} day(s)):
                    </div>
                    <div className='space-y-3'>
                      {Object.entries(slotsByDay).map(([day, slots]) => (
                        <div className='rounded-md border p-3' key={day}>
                          <div className='mb-2 text-sm font-semibold'>
                            {format(new Date(day), 'EEEE, MMMM d, yyyy')} ({day}
                            )
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {slots.length} slot(s)
                          </div>
                          <div className='mt-2 space-y-1'>
                            {slots.map((slot, index) => (
                              <div
                                className='rounded bg-muted p-2 text-xs'
                                key={index}
                              >
                                <div>
                                  <span className='font-medium'>Start:</span>{' '}
                                  {format(new Date(slot.startAt), 'HH:mm:ss')}
                                </div>
                                <div>
                                  <span className='font-medium'>End:</span>{' '}
                                  {format(new Date(slot.endAt), 'HH:mm:ss')}
                                </div>
                                <div>
                                  <span className='font-medium'>Duration:</span>{' '}
                                  {slot.durationMn} minutes
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='text-sm font-medium'>
                      Test getSlotsByDay Function:
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='testDate'>Select a Date</Label>
                      <Input
                        id='testDate'
                        onChange={e => setTestDateLocal(e.target.value)}
                        type='date'
                        value={testDateLocal}
                      />
                      {testDateLocal && (
                        <div className='rounded-md border p-3'>
                          <div className='mb-2 text-sm font-semibold'>
                            Slots for{' '}
                            {format(
                              new Date(testDateLocal),
                              'EEEE, MMMM d, yyyy'
                            )}
                            :
                          </div>
                          {slotsForTestDate.length > 0 ? (
                            <div className='space-y-1'>
                              {slotsForTestDate.map((slot, index) => (
                                <div
                                  className='rounded bg-muted p-2 text-xs'
                                  key={index}
                                >
                                  <div>
                                    <span className='font-medium'>Start:</span>{' '}
                                    {format(new Date(slot.startAt), 'HH:mm:ss')}
                                  </div>
                                  <div>
                                    <span className='font-medium'>End:</span>{' '}
                                    {format(new Date(slot.endAt), 'HH:mm:ss')}
                                  </div>
                                  <div>
                                    <span className='font-medium'>
                                      Duration:
                                    </span>{' '}
                                    {slot.durationMn} minutes
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className='text-sm text-muted-foreground'>
                              No slots found for this date
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
