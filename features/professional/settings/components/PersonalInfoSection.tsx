'use client';

import { FileText, Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import useGetProfessionalJobs from '@/features/professionals/hooks/useGetProfessionalJobs';
import { useUpdateProfessional } from '@/features/professionals/hooks/useUpdateProfessional';

const LANGUAGES_STORAGE_KEY = 'prokid_professional_languages';

export default function PersonalInfoSection() {
  const t = useTranslations('admin.setting');
  const tCommon = useTranslations('common');
  const tProfessional = useTranslations('professional');
  const tOnboarding = useTranslations('professional.onboarding');
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';
  const { data: professional } = useFindProfessional(userId);
  const updateProfessional = useUpdateProfessional();
  const jobOptions = useGetProfessionalJobs();

  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editLanguages, setEditLanguages] = useState('');
  const [editJobValue, setEditJobValue] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editRadiusKm, setEditRadiusKm] = useState('');
  const [editExperienceYears, setEditExperienceYears] = useState('');
  const [languagesRefresh, setLanguagesRefresh] = useState(0);

  const languagesStored =
    typeof window !== 'undefined' && userId
      ? (localStorage.getItem(`${LANGUAGES_STORAGE_KEY}_${userId}`) ?? '')
      : '';

  const languagesDisplay = languagesStored || t('psMockLanguages');

  const jobLabel = useMemo(() => {
    if (!professional?.current_job) {
      return t('psMockRole');
    }
    const key = `jobs.${professional.current_job}`;
    const label = tProfessional(key);
    if (label === key || label === `professional.${key}`) {
      return professional.current_job;
    }
    return label;
  }, [professional?.current_job, t, tProfessional]);

  const description =
    professional?.description?.trim() || t('psMockDescription');
  const roleDisplay = jobLabel;

  const startEdit = () => {
    if (!professional) {
      return;
    }
    setEditDescription(
      professional.description?.trim() || t('psMockDescription')
    );
    setEditLanguages(languagesStored || t('psMockLanguages'));
    setEditJobValue(
      professional.current_job ||
        jobOptions[0]?.value ||
        'psychomotor_therapist'
    );
    setEditCity(professional.city ?? '');
    setEditPostalCode(professional.postal_code ?? '');
    setEditRadiusKm(String(professional.intervention_radius_km ?? ''));
    setEditExperienceYears(String(professional.experience_years ?? ''));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const save = async () => {
    if (!userId || !professional) {
      return;
    }
    const cityTrimmed = editCity.trim();
    if (!cityTrimmed) {
      toast.error(tOnboarding('validation.cityRequired'));
      return;
    }
    const radiusNum = Number.parseInt(editRadiusKm, 10);
    if (Number.isNaN(radiusNum) || radiusNum < 5) {
      toast.error(tOnboarding('validation.interventionZoneMin'));
      return;
    }
    if (radiusNum > 100) {
      toast.error(tOnboarding('validation.interventionZoneMax'));
      return;
    }
    const expYearsNum = Number.parseInt(editExperienceYears, 10);
    if (Number.isNaN(expYearsNum) || expYearsNum < 0) {
      toast.error(tCommon('label.yearsExperience'));
      return;
    }
    try {
      await updateProfessional.mutateAsync({
        professionalId: userId,
        updateData: {
          city: cityTrimmed,
          current_job: editJobValue || null,
          description: editDescription.trim() || null,
          experience_years: expYearsNum,
          intervention_radius_km: radiusNum,
          postal_code: editPostalCode.trim() || null,
        },
      });
      localStorage.setItem(
        `${LANGUAGES_STORAGE_KEY}_${userId}`,
        editLanguages.trim()
      );
      setLanguagesRefresh(n => n + 1);
      setIsEditing(false);
      toast.success(t('saveChanges'));
    } catch {
      toast.error(t('loading'));
    }
  };

  if (!professional) {
    return null;
  }

  const addressRead =
    professional.city && professional.postal_code
      ? `${professional.city}, ${professional.postal_code}`
      : professional.city || professional.postal_code || '—';

  return (
    <section className='rounded-xl bg-white p-6 shadow-sm'>
      <h2 className='mb-4 flex w-full flex-wrap items-center gap-2 text-xl font-bold'>
        <FileText className='size-6 text-[#4A90E2]' />
        {t('psProfessionalInfo')}
        {!isEditing && (
          <Button
            className='ml-auto text-slate-400 hover:bg-slate-100 hover:text-[#4A90E2]'
            onClick={startEdit}
            size='icon'
            variant='ghost'
          >
            <Pencil className='size-5' />
          </Button>
        )}
      </h2>
      {isEditing ? (
        <div className='space-y-4'>
          <div>
            <Label className='text-slate-600' htmlFor='pro-desc'>
              {t('professionalInformation')}
            </Label>
            <Textarea
              className='mt-1.5 min-h-[120px] border-slate-200 bg-slate-50 focus-visible:ring-[#4A90E2]/20'
              id='pro-desc'
              onChange={e => setEditDescription(e.target.value)}
              value={editDescription}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-lg bg-[#f6f6f8] p-4'>
              <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
                {t('psMainRole')}
              </span>
              <Select onValueChange={setEditJobValue} value={editJobValue}>
                <SelectTrigger className='mt-1 border-slate-200 bg-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobOptions.map(j => (
                    <SelectItem key={j.value} value={j.value}>
                      {j.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-lg bg-[#f6f6f8] p-4'>
              <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
                {t('experienceYears')}
              </span>
              <p className='mt-1 text-sm text-slate-500'>
                Calculé automatiquement depuis vos expériences
              </p>
            </div>
            <div className='rounded-lg bg-[#f6f6f8] p-4'>
              <Label
                className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'
                htmlFor='pro-radius'
              >
                {t('interventionRadius')} (km)
              </Label>
              <Input
                className='mt-1 border-slate-200 bg-white'
                id='pro-radius'
                max={100}
                min={5}
                onChange={e => setEditRadiusKm(e.target.value)}
                type='number'
                value={editRadiusKm}
              />
            </div>
          </div>
          <div className='rounded-lg bg-[#f6f6f8] p-4'>
            <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
              {t('psAddress')}
            </span>
            <div className='mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Input
                className='border-slate-200 bg-white'
                onChange={e => setEditCity(e.target.value)}
                placeholder={tCommon('label.city')}
                value={editCity}
              />
              <Input
                className='border-slate-200 bg-white'
                onChange={e => setEditPostalCode(e.target.value)}
                placeholder={tCommon('label.postalCode')}
                value={editPostalCode}
              />
            </div>
          </div>

          <div className='ml-auto flex flex-wrap justify-end gap-2'>
            <Button onClick={cancelEdit} type='button' variant='outline'>
              {t('psCancel')}
            </Button>
            <Button
              className='bg-[#4A90E2] hover:opacity-90'
              disabled={updateProfessional.isPending}
              onClick={save}
              type='button'
            >
              {t('psSave')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className='mb-6 leading-relaxed text-slate-600'>{description}</p>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-lg bg-[#f6f6f8] p-4'>
              <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
                {t('psMainRole')}
              </span>
              <p className='font-medium'>{roleDisplay}</p>
            </div>
            <div className='rounded-lg bg-[#f6f6f8] p-4'>
              <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
                {t('psAddress')}
              </span>
              <p className='font-medium'>{addressRead}</p>
            </div>
            <div className='rounded-lg bg-[#f6f6f8] p-4 sm:col-span-2'>
              <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
                {t('interventionRadius')}
              </span>
              <p className='font-medium'>
                {professional.intervention_radius_km != null
                  ? `${professional.intervention_radius_km} km`
                  : '—'}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
