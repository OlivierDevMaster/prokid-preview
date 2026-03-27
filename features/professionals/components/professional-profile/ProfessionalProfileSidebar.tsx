'use client';

import {
  Briefcase,
  Building2,
  GraduationCap,
  ListChecks,
  MapPin,
  Plus,
  UserCheck,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useGetCertifications } from '@/features/professional/certifications/hooks/useGetCertifications';
import { useGetExperiences } from '@/features/professional/experiences/hooks/useGetExperiences';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useRole } from '@/hooks/useRole';
import { useRouter } from '@/i18n/routing';

import { translateProfessionalJob } from './professional-profile-job';

type ProfessionalProfileSidebarProps = {
  professionalId: string;
};

export function ProfessionalProfileSidebar({
  professionalId,
}: ProfessionalProfileSidebarProps) {
  const t = useTranslations('professional.profile');
  const tProfessional = useTranslations('professional');
  const router = useRouter();
  const { data: session } = useSession();
  const { isStructure } = useRole();
  const { data: professional } = useFindProfessional(professionalId);
  const { data: experiences = [] } = useGetExperiences(professionalId);
  const { data: certifications = [] } = useGetCertifications(professionalId);

  if (!professional) {
    return null;
  }

  const city = professional.city ?? '';
  const postal = professional.postal_code ?? '';
  const radius = professional.intervention_radius_km ?? 10;
  const sectorValue = postal
    ? t('sectorValue', { city, postal, radius })
    : city
      ? t('sectorValueCityOnly', { city, radius })
      : '';

  // Calculate experience from actual experience entries
  const expYears = experiences.length > 0
    ? (() => {
        const now = new Date();
        const totalMonths = experiences.reduce((sum, exp) => {
          const start = new Date(exp.start_date);
          const end = exp.end_date ? new Date(exp.end_date) : now;
          const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          return sum + Math.max(months, 1);
        }, 0);
        return Math.round(totalMonths / 12);
      })()
    : 0;
  const experienceValue = expYears > 0
    ? t('yearsExperience', { years: expYears })
    : t('noExperience');

  // Real stats
  const missionsCompleted = (professional as unknown as { missions_count?: number }).missions_count ?? 0;
  const partnerStructures = (professional as unknown as { structures_count?: number }).structures_count ?? 0;

  const showStructureActions = Boolean(session && isStructure);

  const handleCreateMission = () => {
    router.push(`/structure/missions/new?professional_id=${professionalId}`);
  };

  return (
    <div className='col-span-12 flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-4 lg:self-start'>
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h3 className='mb-6 text-lg font-bold'>{t('inBrief')}</h3>
        <div className='space-y-5'>
          {professional.current_job && (
            <div className='flex items-center gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
                <UserCheck className='size-6' />
              </div>
              <div>
                <p className='text-sm text-slate-500'>Poste</p>
                <p className='font-bold text-slate-900'>
                  {translateProfessionalJob(professional.current_job, tProfessional)}
                </p>
              </div>
            </div>
          )}
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
              <Briefcase className='size-6' />
            </div>
            <div>
              <p className='text-sm text-slate-500'>{t('experienceLabel')}</p>
              <p className='font-bold text-slate-900'>{experienceValue}</p>
            </div>
          </div>
          {certifications.length > 0 && (
            <div className='flex items-center gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
                <GraduationCap className='size-6' />
              </div>
              <div>
                <p className='text-sm text-slate-500'>Diplômes</p>
                <p className='font-bold text-slate-900'>
                  {certifications.length} certification{certifications.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
          {missionsCompleted > 0 && (
            <div className='flex items-center gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
                <ListChecks className='size-6' />
              </div>
              <div>
                <p className='text-sm text-slate-500'>{t('missionsCompleted')}</p>
                <p className='font-bold text-slate-900'>
                  {t('missionsCompletedCount', { count: missionsCompleted })}
                </p>
              </div>
            </div>
          )}
          {partnerStructures > 0 && (
            <div className='flex items-center gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
                <Building2 className='size-6' />
              </div>
              <div>
                <p className='text-sm text-slate-500'>
                  {t('partnerStructuresSidebar')}
                </p>
                <p className='font-bold text-slate-900'>
                  {t('establishmentsCount', { count: partnerStructures })}
                </p>
              </div>
            </div>
          )}
          {(city || sectorValue) && (
            <div className='flex items-center gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
                <MapPin className='size-6' />
              </div>
              <div>
                <p className='text-sm text-slate-500'>{t('sectorLabel')}</p>
                <p className='font-bold text-slate-900'>{sectorValue}</p>
              </div>
            </div>
          )}
        </div>

        {showStructureActions ? (
          <div className='mt-8'>
            <Button
              className='h-12 w-full rounded-xl bg-[#4A90E2] text-lg font-bold shadow-lg shadow-[#4A90E2]/30 hover:bg-[#357ABD]'
              onClick={handleCreateMission}
            >
              <Plus className='mr-2 size-5' />
              {t('proposeMission')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
