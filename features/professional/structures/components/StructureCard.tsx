'use client';

import { Building2, Clock, FileText, MapPin, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { StructureMemberWithStructure } from '@/features/structure-members/structureMember.model';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StructureCardProps {
  structureMember: StructureMemberWithStructure;
}

export function StructureCard({ structureMember }: StructureCardProps) {
  const structure = structureMember.structure;
  // const progressPercentage =
  //   (structure.hoursCompleted / structure.hoursTotal) * 100;

  const progressPercentage = 60;

  const statusConfig = {
    on_time: {
      bgColor: 'bg-green-50',
      dotColor: 'bg-green-500',
      label: 'Dans les temps',
      textColor: 'text-green-700',
    },
    to_monitor: {
      bgColor: 'bg-orange-50',
      dotColor: 'bg-orange-500',
      label: 'À surveiller',
      textColor: 'text-orange-700',
    },
  };

  const status = statusConfig['on_time'];
  const router = useRouter();

  return (
    <Card className='rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md'>
      <div className='p-6'>
        {/* Header */}
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-200'>
              <Building2 className='h-6 w-6 text-white' />
            </div>
            <div>
              <h3 className='mb-1 text-lg font-bold text-gray-900'>
                {structure.name}
              </h3>
              <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                <MapPin className='h-4 w-4 text-gray-400' />
                {/* <span>{structure.location}</span> */}
              </div>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1',
              status.bgColor,
              status.textColor
            )}
          >
            <div className={cn('h-2 w-2 rounded-full', status.dotColor)} />
            <span className='text-xs font-medium'>{status.label}</span>
          </div>
        </div>

        {/* Details */}
        <div className='mb-4 space-y-3'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <Phone className='h-4 w-4 text-gray-400' />
            {/* <span>{structure.email}</span> */}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Clock className='h-4 w-4 text-gray-400' />
              <span>Heures effectuées</span>
            </div>
            <div className='flex items-center gap-3'>
              <div className='h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100'>
                <div className='flex h-full'>
                  <div
                    className='h-full bg-blue-500'
                    style={{ width: `${progressPercentage}%` }}
                  />
                  <div
                    className='h-full bg-green-200'
                    style={{ width: `${100 - progressPercentage}%` }}
                  />
                </div>
              </div>
              <span className='whitespace-nowrap text-sm font-medium text-gray-700'>
                {/* {structure.hoursCompleted}h / {structure.hoursTotal}h */}
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <FileText className='h-4 w-4 text-gray-400' />
            <span>Dernier compte rendu</span>
            {/* <span className='text-gray-500'>{structure.lastReportDate}</span> */}
          </div>
        </div>

        {/* Action Button */}
        <Button
          className='w-full border-gray-300 text-gray-700 hover:bg-gray-50'
          onClick={() =>
            router.push(`/professional/structures/${structure.user_id}`)
          }
          variant='outline'
        >
          Voir les détails
        </Button>
      </div>
    </Card>
  );
}
