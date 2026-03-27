'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  MapPin,
  MessageCircle,
  Monitor,
  User,
} from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMissionStatusConfig } from '@/features/missions/mission.model';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import type { StructureMission } from '../modeles/mission.modele';

const MODALITY_LABELS: Record<string, string> = {
  hybrid: 'Hybride',
  on_site: 'Sur site',
  remote: 'À distance',
};

interface MissionDetailsDialogProps {
  isLoading: boolean;
  mission: null | StructureMission;
  onClose: () => void;
  open: boolean;
}

export function MissionDetailsDialog({
  isLoading,
  mission,
  onClose,
  open,
}: MissionDetailsDialogProps) {
  const locale = (useLocale() as 'en' | 'fr') || 'en';
  const statusConfig = getMissionStatusConfig(locale);

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className='max-w-lg overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-lg'>
            {mission?.title || 'Détails de la mission'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='py-6 text-center text-sm text-slate-400'>Chargement...</div>
        ) : mission ? (
          <div className='space-y-5'>
            {/* Status */}
            {(() => {
              const status = statusConfig[mission.status] || statusConfig.pending;
              return (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                    status.bgColor,
                    status.textColor
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', status.dotColor)} />
                  {status.label}
                </span>
              );
            })()}

            {/* Info grid */}
            <div className='grid grid-cols-2 gap-3'>
              <InfoItem
                label='Professionnel'
                value={
                  mission.professional?.profile
                    ? `${mission.professional.profile.first_name || ''} ${mission.professional.profile.last_name || ''}`.trim() || 'Professionnel'
                    : 'Professionnel'
                }
              />
              <InfoItem
                label='Période'
                value={
                  mission.mission_dtstart && mission.mission_until
                    ? `${format(new Date(mission.mission_dtstart), 'd MMM yyyy', { locale: fr })} — ${format(new Date(mission.mission_until), 'd MMM yyyy', { locale: fr })}`
                    : '—'
                }
              />
              {mission.modality && (
                <InfoItem
                  label='Modalité'
                  value={MODALITY_LABELS[mission.modality] || mission.modality}
                />
              )}
              {mission.address && (mission.modality === 'on_site' || mission.modality === 'hybrid') && (
                <InfoItem label='Adresse' value={mission.address} />
              )}
            </div>

            {/* Description */}
            {mission.description && (
              <div>
                <p className='mb-1 text-xs font-medium text-slate-400'>Description</p>
                <p className='text-sm leading-relaxed text-slate-600'>{mission.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className='flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row'>
              <Link className='flex-1' href='/structure/chat'>
                <Button className='h-10 w-full rounded-xl bg-blue-600 text-sm text-white hover:bg-blue-700'>
                  <MessageCircle className='mr-2 h-4 w-4' />
                  Ouvrir la messagerie
                </Button>
              </Link>
              <Button
                className='h-10 rounded-xl text-sm'
                onClick={onClose}
                variant='outline'
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <div className='py-6 text-center text-sm text-slate-400'>Mission introuvable.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='space-y-0.5'>
      <p className='text-xs font-medium text-slate-400'>{label}</p>
      <p className='text-sm font-medium text-slate-800'>{value}</p>
    </div>
  );
}
