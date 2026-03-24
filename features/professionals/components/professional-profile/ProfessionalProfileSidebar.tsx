'use client';

import {
  Briefcase,
  Building2,
  Heart,
  ListChecks,
  MapPin,
  Plus,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { RatingModal } from '@/features/structure/ratings/components/RatingModal';
import { useCreateRating } from '@/features/structure/ratings/hooks/useCreateRating';
import { useRatingForStructureAndProfessional } from '@/features/structure/ratings/hooks/useRatingForStructureAndProfessional';
import { useRole } from '@/hooks/useRole';
import { useRouter } from '@/i18n/routing';

import {
  MOCK_MISSIONS_COMPLETED,
  MOCK_PARTNER_COUNT,
} from './professional-profile-mock';

type ProfessionalProfileSidebarProps = {
  professionalId: string;
};

export function ProfessionalProfileSidebar({
  professionalId,
}: ProfessionalProfileSidebarProps) {
  const t = useTranslations('professional.profile');
  const tRating = useTranslations('structure.ratings');
  const router = useRouter();
  const { data: session } = useSession();
  const { isStructure, userId } = useRole();
  const { data: professional } = useFindProfessional(professionalId);
  const { data: existingRating } = useRatingForStructureAndProfessional(
    userId ?? undefined,
    professionalId
  );
  const createRating = useCreateRating();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  if (!professional) {
    return null;
  }

  const city = professional.city ?? 'Lyon';
  const postal = professional.postal_code ?? '69002';
  const radius = professional.intervention_radius_km ?? 10;
  const sectorValue = postal
    ? t('sectorValue', { city, postal, radius })
    : t('sectorValueCityOnly', { city, radius });
  const experienceValue = t('yearsAndMonthsExperience', {
    months: 4,
    years: professional.experience_years ?? 8,
  });

  const showStructureActions = Boolean(session && isStructure);
  const canRate = Boolean(session && isStructure && !existingRating);

  const handleCreateMission = () => {
    router.push(`/structure/missions/new?professional_id=${professionalId}`);
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!userId || !professionalId) {
      toast.error(tRating('ratingError'));
      return;
    }
    try {
      await createRating.mutateAsync({
        comment: comment || null,
        professionalId,
        rating,
        structureId: userId,
      });
      toast.success(tRating('ratingSuccess'));
      setIsRatingModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : tRating('ratingError')
      );
    }
  };

  return (
    <div className='col-span-12 flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-4 lg:self-start'>
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h3 className='mb-6 text-lg font-bold'>{t('inBrief')}</h3>
        <div className='space-y-6'>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
              <Briefcase className='size-6' />
            </div>
            <div>
              <p className='text-sm text-slate-500'>{t('experienceLabel')}</p>
              <p className='font-bold text-slate-900'>{experienceValue}</p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
              <ListChecks className='size-6' />
            </div>
            <div>
              <p className='text-sm text-slate-500'>{t('missionsCompleted')}</p>
              <p className='font-bold text-slate-900'>
                {t('missionsCompletedCount', {
                  count: MOCK_MISSIONS_COMPLETED,
                })}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
              <Building2 className='size-6' />
            </div>
            <div>
              <p className='text-sm text-slate-500'>
                {t('partnerStructuresSidebar')}
              </p>
              <p className='font-bold text-slate-900'>
                {t('establishmentsCount', { count: MOCK_PARTNER_COUNT })}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
              <MapPin className='size-6' />
            </div>
            <div>
              <p className='text-sm text-slate-500'>{t('sectorLabel')}</p>
              <p className='font-bold text-slate-900'>{sectorValue}</p>
            </div>
          </div>
        </div>

        {showStructureActions ? (
          <div className='mt-8 space-y-3'>
            <Button
              className='h-12 w-full rounded-xl bg-[#4A90E2] text-lg font-bold shadow-lg shadow-[#4A90E2]/30 hover:bg-[#357ABD]'
              onClick={handleCreateMission}
            >
              <Plus className='mr-2 size-5' />
              {t('proposeMission')}
            </Button>
            {/* {canRate ? (
              <Button
                className='w-full rounded-xl'
                onClick={() => setIsRatingModalOpen(true)}
                variant='outline'
              >
                <Heart className='mr-2 size-4' />
                {tRating('rateProfessional')}
              </Button>
            ) : null} */}
          </div>
        ) : null}
      </div>

      <RatingModal
        isOpen={isRatingModalOpen}
        isSubmitting={createRating.isPending}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
}
