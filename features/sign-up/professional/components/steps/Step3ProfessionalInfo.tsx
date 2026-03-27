'use client';

import { Briefcase, ChevronDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useGetProfessionalJobs from '@/features/professionals/hooks/useGetProfessionalJobs';
import { cn } from '@/lib/utils';

const DESCRIPTION_MAX_LENGTH = 500;

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
    <div className='space-y-5'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
          {t('yourProfessionalActivity')}
        </h1>
      </div>

      {/* PROFESSIONAL ACTIVITY */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-slate-800'>
          {t('professionalDetails')}
        </h2>

        <div className='space-y-1.5'>
          <Label
            className='text-xs font-medium text-slate-600'
            htmlFor='profession'
          >
            {t('job')} *
          </Label>
          <Controller
            control={control}
            name='profession'
            render={({ field }) => (
              <div className='relative'>
                <Briefcase className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <select
                  className='flex h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
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
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
              </div>
            )}
          />
          {errors.profession && (
            <p className='text-sm text-red-500'>{errors.profession.message}</p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label
            className='text-xs font-medium text-slate-600'
            htmlFor='yearsExperience'
          >
            {t('yearsExperience')}
          </Label>
          <Controller
            control={control}
            name='yearsExperience'
            render={({ field }) => (
              <input
                className='flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                id='yearsExperience'
                max={50}
                min={0}
                onChange={field.onChange}
                placeholder='Ex: 5'
                type='number'
                value={field.value}
              />
            )}
          />
        </div>
      </section>

      {/* SKILLS */}
      <section className='space-y-3'>
        <div>
          <h2 className='text-lg font-semibold text-slate-800'>
            {t('skillsCountLabel', { current: skills.length })}
          </h2>
          <p className='mt-0.5 text-sm text-slate-400'>{t('skillsHelper')}</p>
        </div>

        <div className='flex gap-2'>
          <input
            className='flex h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={isSkillsMax}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const trimmed = skillInput.trim();
                if (trimmed && !skills.includes(trimmed) && skills.length < 5) {
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
            className='h-10 rounded-xl border-slate-200'
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
          >
            {tCommon('add')}
          </Button>
        </div>

        <div className='flex flex-wrap gap-2'>
          {professionalJobs
            .slice(0, 6)
            .map((job: { label: string; value: string }) => (
              <button
                className={cn(
                  'inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  skills.includes(job.label)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  isSkillsMax &&
                    !skills.includes(job.label) &&
                    'cursor-not-allowed opacity-40'
                )}
                key={job.value}
                onClick={() => toggleSkill(job.label)}
                type='button'
              >
                {job.label}
              </button>
            ))}
        </div>

        {skills.length > 0 && (
          <div className='flex flex-wrap gap-2 pt-1'>
            {skills.map((skill, index) => (
              <span
                className='inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600'
                key={`${skill}-${index}`}
              >
                {skill}
                <button
                  className='rounded-full p-0.5 transition-colors hover:bg-blue-100'
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
              </span>
            ))}
          </div>
        )}
        {errors.skills && (
          <p className='text-sm text-red-500'>{errors.skills.message}</p>
        )}
      </section>

      {/* WORK AREA */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-slate-800'>
          {t('workArea')}
        </h2>
        <div className='space-y-3'>
          <Controller
            control={control}
            name='interventionZone'
            render={({ field }) => (
              <>
                <div className='flex items-center justify-between'>
                  <Label className='text-xs font-medium text-slate-600'>
                    {t('interventionZone')}
                  </Label>
                  <span className='rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600'>
                    {field.value} {t('km')}
                  </span>
                </div>
                <div className='relative pt-1'>
                  <input
                    className='h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md'
                    max={100}
                    min={5}
                    onChange={e => field.onChange(parseInt(e.target.value, 10))}
                    step={5}
                    type='range'
                    value={field.value}
                  />
                </div>
                <div className='flex justify-between text-xs text-slate-400'>
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
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-slate-800'>
          {t('aboutYou')}
        </h2>
        <div className='space-y-1.5'>
          <Label
            className='text-xs font-medium text-slate-600'
            htmlFor='description'
          >
            {t('descriptionOptional')}
          </Label>
          <p className='text-xs text-slate-400'>{t('descriptionHelper')}</p>
          <Controller
            control={control}
            name='description'
            render={({ field }) => (
              <div className='relative'>
                <textarea
                  className='min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  id='description'
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  onChange={field.onChange}
                  placeholder={t('descriptionPlaceholder')}
                  value={field.value ?? ''}
                />
                <span className='absolute bottom-3 right-3 text-xs text-slate-400'>
                  {(field.value ?? '').length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            )}
          />
        </div>
      </section>

      {/* NAVIGATION */}
      <div className='flex justify-end gap-3 pt-2'>
        <Button
          className='h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50'
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          {tCommon('previous')}
        </Button>
        <Button
          className='h-10 rounded-xl bg-blue-600 px-8 text-sm text-white hover:bg-blue-700'
          onClick={onNext}
          type='button'
        >
          {tCommon('next')}
        </Button>
      </div>
    </div>
  );
}
