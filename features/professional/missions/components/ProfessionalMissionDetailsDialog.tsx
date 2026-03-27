'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Building2,
  Calendar,
  Check,
  FilePlus,
  Loader2,
  MapPin,
  MessageCircle,
  Monitor,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAcceptMission, useDeclineMission } from '@/features/missions/hooks';
import {
  getMissionStatusConfig,
  MissionStatus,
  type MissionWithStructure,
} from '@/features/missions/mission.model';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const MODALITY_LABELS: Record<string, string> = {
  hybrid: 'Hybride',
  on_site: 'Sur site',
  remote: 'À distance',
};

interface ProfessionalMissionDetailsDialogProps {
  isLoading: boolean;
  mission: MissionWithStructure | null;
  onClose: () => void;
  open: boolean;
}

export function ProfessionalMissionDetailsDialog({
  isLoading,
  mission,
  onClose,
  open,
}: ProfessionalMissionDetailsDialogProps) {
  const t = useTranslations('professional.missions');
  const locale = (useLocale() as 'en' | 'fr') || 'en';

  const statusConfig = getMissionStatusConfig(locale);

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col overflow-y-auto'>
        {isLoading ? (
          <DialogHeader>
            <DialogTitle>Détails de la mission</DialogTitle>
          </DialogHeader>
        ) : mission ? (
          <MissionDetailsContent
            locale={locale}
            mission={mission}
            onClose={onClose}
            statusConfig={statusConfig}
            t={t}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Mission</DialogTitle>
            </DialogHeader>
            <div className='py-8 text-center text-slate-500'>
              Mission introuvable.
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface MissionDetailsContentProps {
  locale: 'en' | 'fr';
  mission: MissionWithStructure;
  onClose: () => void;
  statusConfig: ReturnType<typeof getMissionStatusConfig>;
  t: (key: string) => string;
}

function MissionDetailsContent({
  locale,
  mission,
  onClose,
  statusConfig,
  t,
}: MissionDetailsContentProps) {
  const queryClient = useQueryClient();
  const { isPending: isAccepting, mutate: acceptMission } = useAcceptMission();
  const { isPending: isDeclining, mutate: declineMission } =
    useDeclineMission();

  const isProcessing = isAccepting || isDeclining;
  const canAcceptOrDecline = mission.status === MissionStatus.pending;
  const canCreateReport =
    mission.status === MissionStatus.accepted ||
    mission.status === MissionStatus.ended;

  const status = statusConfig[mission.status] || statusConfig.pending;

  const structureName =
    mission.structure?.name ||
    (mission.structure?.profile
      ? `${mission.structure.profile.first_name || ''} ${mission.structure.profile.last_name || ''}`.trim() ||
        mission.structure.profile.email ||
        t('unknownStructure')
      : t('unknownStructure'));

  const periodLabel =
    mission.mission_dtstart && mission.mission_until
      ? `${format(new Date(mission.mission_dtstart), 'd MMMM yyyy', { locale: fr })} - ${format(new Date(mission.mission_until), 'd MMMM yyyy', { locale: fr })}`
      : '—';

  const modalityLabel = mission.modality
    ? MODALITY_LABELS[mission.modality] || mission.modality
    : null;

  const showAddress =
    mission.address &&
    (mission.modality === 'on_site' || mission.modality === 'hybrid');

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['professional-missions'] });
    queryClient.invalidateQueries({
      queryKey: ['professional-mission', mission.id],
    });
    queryClient.invalidateQueries({ queryKey: ['missions'] });
    queryClient.invalidateQueries({ queryKey: ['mission'] });
    queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
  };

  const handleAccept = () => {
    acceptMission(mission.id, {
      onError: error => {
        toast.error(
          error instanceof Error
            ? error.message
            : t('acceptError') || 'Erreur lors de l\'acceptation'
        );
      },
      onSuccess: () => {
        invalidateAll();
        toast.success(t('acceptSuccess') || 'Mission acceptée');
        onClose();
      },
    });
  };

  const handleDecline = () => {
    declineMission(mission.id, {
      onError: error => {
        toast.error(
          error instanceof Error
            ? error.message
            : t('declineError') || 'Erreur lors du refus'
        );
      },
      onSuccess: () => {
        invalidateAll();
        toast.success(t('declineSuccess') || 'Mission refusée');
        onClose();
      },
    });
  };

  return (
    <>
      {/* Header */}
      <DialogHeader>
        <DialogTitle className='flex items-center gap-3 text-lg'>
          <span>{mission.title}</span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
              status.bgColor,
              status.textColor
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dotColor)} />
            {status.label}
          </span>
        </DialogTitle>
      </DialogHeader>

      {/* Quick info grid */}
      <div className='my-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3'>
          <Building2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400' />
          <div>
            <p className='text-xs font-medium text-slate-400'>Structure</p>
            <p className='text-sm text-slate-700'>{structureName}</p>
          </div>
        </div>

        <div className='flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3'>
          <Calendar className='mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400' />
          <div>
            <p className='text-xs font-medium text-slate-400'>Période</p>
            <p className='text-sm text-slate-700'>{periodLabel}</p>
          </div>
        </div>

        {modalityLabel && (
          <div className='flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3'>
            <Monitor className='mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400' />
            <div>
              <p className='text-xs font-medium text-slate-400'>Modalité</p>
              <p className='text-sm text-slate-700'>{modalityLabel}</p>
            </div>
          </div>
        )}

        {showAddress && (
          <div className='flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3'>
            <MapPin className='mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400' />
            <div>
              <p className='text-xs font-medium text-slate-400'>Adresse</p>
              <p className='text-sm text-slate-700'>{mission.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {mission.description && (
        <div className='mb-4 rounded-lg border border-slate-100 bg-slate-50 p-4'>
          <h3 className='mb-1 text-xs font-medium text-slate-400'>
            Description
          </h3>
          <p className='text-sm leading-relaxed text-slate-700'>
            {mission.description}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className='flex flex-col gap-2 border-t border-slate-100 pt-4'>
        {canAcceptOrDecline && (
          <div className='flex gap-2'>
            <Button
              className='h-10 flex-1 rounded-xl bg-green-600 text-sm text-white hover:bg-green-700'
              disabled={isProcessing}
              onClick={handleAccept}
            >
              {isAccepting ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Check className='mr-2 h-4 w-4' />
              )}
              Accepter
            </Button>
            <Button
              className='h-10 flex-1 rounded-xl border-red-300 text-sm text-red-700 hover:bg-red-50'
              disabled={isProcessing}
              onClick={handleDecline}
              variant='outline'
            >
              {isDeclining ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <X className='mr-2 h-4 w-4' />
              )}
              Décliner
            </Button>
          </div>
        )}

        <div className='flex gap-2'>
          <Link className='flex-1' href='/professional/chat'>
            <Button className='h-10 w-full rounded-xl bg-blue-600 text-sm text-white hover:bg-blue-700'>
              <MessageCircle className='mr-2 h-4 w-4' />
              Ouvrir la messagerie
            </Button>
          </Link>

          {canCreateReport && (
            <Link className='flex-1' href={`/professional/reports/new?mission=${mission.id}`}>
              <Button className='h-10 w-full rounded-xl text-sm' variant='outline'>
                <FilePlus className='mr-2 h-4 w-4' />
                Rédiger un rapport
              </Button>
            </Link>
          )}

          <Button className='h-10 rounded-xl text-sm' onClick={onClose} variant='outline'>
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}
