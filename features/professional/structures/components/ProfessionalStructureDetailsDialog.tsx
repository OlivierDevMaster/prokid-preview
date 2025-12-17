'use client';

import { format } from 'date-fns';
import { Building2, Calendar, FileText, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import type { StructureMemberWithStructure } from '@/features/structure-members/structureMember.model';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMembershipMissionDurations } from '@/features/mission-durations';
import { useLastReport } from '@/features/professional/structures/hooks/useLastReport';

interface ProfessionalStructureDetailsDialogProps {
  isLoading: boolean;
  onClose: () => void;
  open: boolean;
  structureMember: null | StructureMemberWithStructure;
}

interface StructureDetailsContentProps {
  onClose: () => void;
  structureMember: StructureMemberWithStructure;
  t: (key: string) => string;
}

export function ProfessionalStructureDetailsDialog({
  isLoading,
  onClose,
  open,
  structureMember,
}: ProfessionalStructureDetailsDialogProps) {
  const t = useTranslations('professional.structure');

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className='max-w-2xl'>
        {isLoading ? (
          <div className='py-8 text-center text-gray-600'>{t('loading')}</div>
        ) : structureMember ? (
          <StructureDetailsContent
            onClose={onClose}
            structureMember={structureMember}
            t={t}
          />
        ) : (
          <div className='py-8 text-center text-gray-600'>
            {t('noStructure')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StructureDetailsContent({
  onClose,
  structureMember,
  t,
}: StructureDetailsContentProps) {
  const { data: session } = useSession();
  const professionalId = session?.user?.id ?? null;
  const structure = structureMember.structure;
  const structureId = structure.user_id;

  const { data: missionDurations, isLoading: isLoadingDuration } =
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

  const profile = structure.profile;
  const name = structure.name || profile?.email || 'Unknown';

  return (
    <>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-3'>
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-200'>
            {profile?.avatar_url ? (
              <Image
                alt={name}
                className='h-full w-full rounded-lg object-cover'
                height={40}
                src={profile.avatar_url}
                unoptimized
                width={40}
              />
            ) : (
              <Building2 className='h-5 w-5 text-white' />
            )}
          </div>
          <span>{name}</span>
        </DialogTitle>
        {profile?.email && (
          <DialogDescription>{profile.email}</DialogDescription>
        )}
      </DialogHeader>

      <div className='space-y-4'>
        {/* Contact Information */}
        {profile?.email && (
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <h3 className='mb-3 text-sm font-semibold text-gray-700'>
              {t('contact')}
            </h3>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Mail className='h-4 w-4 text-gray-400' />
              <span>{profile.email}</span>
            </div>
          </div>
        )}

        {/* Duration Progress */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <h3 className='mb-3 text-sm font-semibold text-gray-700'>
            {t('hoursCompleted')}
          </h3>
          <div className='space-y-2'>
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
                {isLoadingDuration
                  ? 'xh / xh'
                  : `${pastDurationHours}h / ${totalDurationHours}h`}
              </span>
            </div>
          </div>
        </div>

        {/* Last Report */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <FileText className='h-4 w-4 text-gray-400' />
            <span>{t('lastReport')}</span>
            {isLoadingLastReport ? (
              <span className='text-gray-500'>...</span>
            ) : lastReport?.title ? (
              <span className='text-gray-500'>{lastReport.title}</span>
            ) : (
              <span className='text-gray-500'>{t('noReport')}</span>
            )}
          </div>
        </div>

        {/* Created At */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <Calendar className='h-4 w-4 text-gray-400' />
            <span>
              {t('createdAt')}:{' '}
              {format(new Date(structure.created_at), 'dd/MM/yyyy')}
            </span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose} variant='outline'>
          {t('close')}
        </Button>
      </DialogFooter>
    </>
  );
}
