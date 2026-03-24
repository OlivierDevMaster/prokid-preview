'use client';

import { Briefcase, ChevronDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useGetProfessionalJobs from '@/features/professionals/hooks/useGetProfessionalJobs';
import { cn } from '@/lib/utils';

const SECTION_TITLE_CLASS =
  'text-sm font-semibold uppercase tracking-wide text-gray-500';

interface Step3ProfessionalInfoProps {
  form: UseFormReturn<ProfessionalSignUpFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step3ProfessionalInfo({
  form,
  onNext,
  onPrevious,
}: Step3ProfessionalInfoProps) {
  const t = useTranslations('auth.signUp.professionalForm');
  const tCommon = useTranslations('common.label');
  const professionalJobs = useGetProfessionalJobs();
  const [skillInput, setSkillInput] = useState('');

  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const skills = watch('skills') || [];
  const isSkillsMax = skills.length >= 5;

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setValue(
        'skills',
        skills.filter(s => s !== skill)
      );
    } else if (!isSkillsMax) {
      setValue('skills', [...skills, skill]);
    }
  };

  const INTERVENTION_TICKS = [5, 20, 40, 60, 80, 100];

  return (
    <div className='space-y-8'>
      <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
        {t('yourProfessionalActivity')}
      </h1>

      {/* PROFESSIONAL ACTIVITY */}
      <section className='space-y-6 pb-2'>
        <h2 className={SECTION_TITLE_CLASS}>{t('professionalDetails')}</h2>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='profession'
          >
            {t('job')} *
          </Label>
          <Controller
            control={control}
            name='profession'
            render={({ field }) => (
              <div className='relative'>
                <Briefcase className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
                <select
                  className='h-12 w-full appearance-none rounded-md border border-gray-300 bg-white pl-10 pr-10 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                  id='profession'
                  onChange={field.onChange}
                  required
                  value={field.value}
                >
                  <option value=''>{t('selectProfession')}</option>
                  {professionalJobs.map(
                    (job: { label: string; value: string }) => (
                      <option key={job.value} value={job.value}>
                        {job.label}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
              </div>
            )}
          />
          {errors.profession && (
            <p className='text-sm text-red-500'>{errors.profession.message}</p>
          )}
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label
              className='text-sm font-medium text-gray-700'
              htmlFor='yearsExperience'
            >
              {t('yearsExperience')}
            </Label>
            <Controller
              control={control}
              name='yearsExperience'
              render={({ field }) => (
                <Input
                  className='h-12 border-gray-300 text-base'
                  id='yearsExperience'
                  max={50}
                  min={0}
                  onChange={field.onChange}
                  type='number'
                  value={field.value}
                />
              )}
            />
          </div>

          <div className='space-y-2'>
            <Label
              className='text-sm font-medium text-gray-700'
              htmlFor='hourlyRate'
            >
              {t('hourlyRate')} *
            </Label>
            <Controller
              control={control}
              name='hourlyRate'
              render={({ field }) => (
                <div className='flex items-center gap-2'>
                  <Input
                    className='h-12 flex-1 border-gray-300 text-base'
                    id='hourlyRate'
                    min={1}
                    onChange={e => {
                      const value = e.target.value;
                      if (value === '') {
                        field.onChange(undefined as unknown as number);
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) field.onChange(numValue);
                      }
                    }}
                    required
                    step='0.01'
                    type='number'
                    value={field.value ?? ''}
                  />
                  <span className='text-base font-medium text-gray-600'>€</span>
                </div>
              )}
            />
            {errors.hourlyRate && (
              <p className='text-sm text-red-500'>
                {errors.hourlyRate.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section className='space-y-4 pb-2'>
        <div>
          <h2 className={SECTION_TITLE_CLASS}>
            {t('skillsCountLabel', { current: skills.length })}
          </h2>
          <p className='mt-0.5 text-sm text-gray-500'>{t('skillsHelper')}</p>
        </div>

        <div>
          <div className='flex gap-2'>
            <Input
              className='h-12 flex-1 border-gray-300 text-base'
              disabled={isSkillsMax}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmed = skillInput.trim();
                  if (
                    trimmed &&
                    !skills.includes(trimmed) &&
                    skills.length < 5
                  ) {
                    setValue('skills', [...skills, trimmed]);
                    setSkillInput('');
                  }
                }
              }}
              placeholder={t('addSkillPlaceholder')}
              type='text'
              value={skillInput}
            />
            <Button
              disabled={!skillInput.trim() || isSkillsMax}
              onClick={() => {
                const trimmed = skillInput.trim();
                if (trimmed && !skills.includes(trimmed) && skills.length < 5) {
                  setValue('skills', [...skills, trimmed]);
                  setSkillInput('');
                }
              }}
              type='button'
              variant='outline'
              className='h-12'
            >
              {tCommon('add')}
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          {professionalJobs
            .slice(0, 6)
            .map((job: { label: string; value: string }) => (
              <Badge
                className={cn(
                  'cursor-pointer rounded-full px-4 py-2 text-sm transition-opacity',
                  isSkillsMax &&
                    !skills.includes(job.label) &&
                    'cursor-not-allowed opacity-50'
                )}
                key={job.value}
                onClick={() => toggleSkill(job.label)}
                variant={skills.includes(job.label) ? 'default' : 'outline'}
              >
                {job.label}
              </Badge>
            ))}
        </div>

        {skills.length > 0 && (
          <div className='pt-2'>
            <p className='mb-2 text-xs font-medium text-gray-500'>
              {t('selectedSkillsLabel')}
            </p>
            <div className='flex flex-wrap gap-2'>
              {skills.map((skill, index) => (
                <Badge
                  className='flex items-center gap-1 rounded-full px-4 py-2 pr-1'
                  key={`${skill}-${index}`}
                  variant='secondary'
                >
                  <span>{skill}</span>
                  <button
                    className='mx-1 rounded-full hover:bg-gray-300 focus:outline-none'
                    onClick={() =>
                      setValue(
                        'skills',
                        skills.filter((_, i) => i !== index)
                      )
                    }
                    type='button'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        {errors.skills && (
          <p className='text-sm text-red-500'>{errors.skills.message}</p>
        )}
      </section>

      {/* WORK AREA */}
      <section className='space-y-4 pb-2'>
        <h2 className={SECTION_TITLE_CLASS}>{t('workArea')}</h2>
        <div className='space-y-2'>
          <Controller
            control={control}
            name='interventionZone'
            render={({ field }) => (
              <>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium text-gray-700'>
                    {t('interventionZone')}
                  </Label>
                  <span className='text-sm font-medium text-gray-600'>
                    {field.value} {t('km')}
                  </span>
                </div>
                <input
                  className='h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600'
                  max={100}
                  min={5}
                  onChange={e => field.onChange(parseInt(e.target.value, 10))}
                  step={5}
                  type='range'
                  value={field.value}
                />
                <div className='flex justify-between text-xs text-gray-400'>
                  {INTERVENTION_TICKS.map(tick => (
                    <span key={tick}>{tick}</span>
                  ))}
                </div>
              </>
            )}
          />
        </div>
      </section>

      {/* ABOUT YOU */}
      <section className='space-y-4 pb-2'>
        <h2 className={SECTION_TITLE_CLASS}>{t('aboutYou')}</h2>
        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='description'
          >
            {t('descriptionOptional')}
          </Label>
          <p className='text-xs text-gray-500'>{t('descriptionHelper')}</p>
          <Controller
            control={control}
            name='description'
            render={({ field }) => (
              <textarea
                className='min-h-[100px] w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                id='description'
                onChange={field.onChange}
                placeholder={t('descriptionPlaceholder')}
                value={field.value ?? ''}
              />
            )}
          />
        </div>
      </section>

      {/* NAVIGATION */}
      <div className='flex justify-end gap-4 pt-6'>
        <Button
          className='min-h-12 flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 md:flex-none'
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          {tCommon('previous')}
        </Button>
        <Button
          className='min-h-12 min-w-40 flex-1 bg-blue-600 text-white hover:bg-blue-700 md:flex-none'
          onClick={onNext}
          type='button'
        >
          {tCommon('next')}
        </Button>
      </div>
    </div>
  );
}
