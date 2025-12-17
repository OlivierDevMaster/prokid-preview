'use client';

import { Building2, Clock, FileText, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import type { StructureMemberWithStructure } from '@/features/structure-members/structureMember.model';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMembershipMissionDurations } from '@/features/mission-durations';
import { useLastReport } from '@/features/professional/structures/hooks/useLastReport';

interface StructureCardProps {
  structureMember: StructureMemberWithStructure;
}

export function StructureCard({ structureMember }: StructureCardProps) {
  const structure = structureMember.structure;
  const { data: session } = useSession();
  const professionalId = session?.user?.id ?? null;
  const structureId = structure.user_id;
  const t = useTranslations('professional.structure');

  const { data: missionDurations, isLoading: isLoadingDurations } =
    useMembershipMissionDurations(professionalId, structureId);
  const { data: lastReport, isLoading: isLoadingLastReport } = useLastReport(
    professionalId,
    structureId
  );

  const progressPercentage = missionDurations?.percentage ?? 0;
  const pastDurationHours = missionDurations?.past_duration_mn
    ? Math.round(missionDurations.past_duration_mn / 60)
    : 0;
  const totalDurationHours = missionDurations?.total_duration_mn
    ? Math.round(missionDurations.total_duration_mn / 60)
    : 0;

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
              {/* Location not available for structures */}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className='mb-4 space-y-3'>
          {structure.profile?.email && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Mail className='h-4 w-4 text-gray-400' />
              <span>{structure.profile.email}</span>
            </div>
          )}

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Clock className='h-4 w-4 text-gray-400' />
              <span>{t('hoursCompleted')}</span>
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
                {isLoadingDurations
                  ? 'xxh / xxh'
                  : `${pastDurationHours}h / ${totalDurationHours}h`}
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <FileText className='h-4 w-4 text-gray-400' />
            <span>{t('lastReport')}</span>
            {isLoadingLastReport ? (
              <span className='text-gray-500'>...</span>
            ) : lastReport?.title ? (
              <span className='text-gray-500'>{lastReport.title}</span>
            ) : null}
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
          {t('viewDetails')}
        </Button>
      </div>
    </Card>
  );
}
