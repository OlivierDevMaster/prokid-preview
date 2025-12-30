'use client';

import { ChevronDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { ProfessionalSignUpFormData } from '@/features/sign-up/professional/hooks/useProfessionalSignUpSchema';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useGetProfessionalJobs from '@/features/professionals/hooks/useGetProfessionalJobs';

import { ProgressBar } from '../ProgressBar';

interface Step2IdentityInfoProps {
  form: UseFormReturn<ProfessionalSignUpFormData>;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2IdentityInfo({
  form,
  onNext,
  onPrevious,
}: Step2IdentityInfoProps) {
  const t = useTranslations('professional');
  const tCommon = useTranslations('common.label');
  const tProfessional = useTranslations('auth.signUp.professionalForm');
  const professionalJobs = useGetProfessionalJobs();
  const [skillInput, setSkillInput] = useState('');

  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const skills = watch('skills') || [];

  return (
    <div className='space-y-6'>
      <ProgressBar currentStep={2} totalSteps={4} />

      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('label.informations')}
        </h1>
        <p className='text-gray-600'>{t('label.completeProfile')}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='firstName'>
            {tCommon('firstName')} *
          </Label>
          <Controller
            control={control}
            name='firstName'
            render={({ field }) => (
              <Input
                className='border-gray-300'
                id='firstName'
                onChange={field.onChange}
                required
                type='text'
                value={field.value}
              />
            )}
          />
          {errors.firstName && (
            <p className='text-sm text-red-500'>{errors.firstName.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='lastName'>
            {tCommon('lastName')} *
          </Label>
          <Controller
            control={control}
            name='lastName'
            render={({ field }) => (
              <Input
                className='border-gray-300'
                id='lastName'
                onChange={field.onChange}
                required
                type='text'
                value={field.value}
              />
            )}
          />
          {errors.lastName && (
            <p className='text-sm text-red-500'>{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='profession'>
            {tProfessional('job')} *
          </Label>
          <Controller
            control={control}
            name='profession'
            render={({ field }) => (
              <div className='relative'>
                <select
                  className='h-9 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                  id='profession'
                  onChange={field.onChange}
                  required
                  value={field.value}
                >
                  <option value=''>Sélectionnez une profession</option>
                  {professionalJobs.map(
                    (job: { label: string; value: string }) => (
                      <option key={job.value} value={job.value}>
                        {job.label}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              </div>
            )}
          />
          {errors.profession && (
            <p className='text-sm text-red-500'>{errors.profession.message}</p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-gray-700' htmlFor='skills'>
          {tProfessional('skills') || 'Skills'} (max 5)
        </Label>
        <div className='space-y-2'>
          <div className='flex gap-2'>
            <Input
              className='border-gray-300'
              disabled={skills.length >= 5}
              id='skills'
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmedSkill = skillInput.trim();
                  if (
                    trimmedSkill &&
                    !skills.includes(trimmedSkill) &&
                    skills.length < 5
                  ) {
                    setValue('skills', [...skills, trimmedSkill]);
                    setSkillInput('');
                  }
                }
              }}
              placeholder={
                skills.length >= 5
                  ? 'Maximum 5 skills reached'
                  : 'Enter a skill and press Enter'
              }
              type='text'
              value={skillInput}
            />
            <Button
              disabled={!skillInput.trim() || skills.length >= 5}
              onClick={() => {
                const trimmedSkill = skillInput.trim();
                if (
                  trimmedSkill &&
                  !skills.includes(trimmedSkill) &&
                  skills.length < 5
                ) {
                  setValue('skills', [...skills, trimmedSkill]);
                  setSkillInput('');
                }
              }}
              type='button'
              variant='outline'
            >
              {tCommon('add')}
            </Button>
          </div>
          {skills.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {skills.map((skill, index) => (
                <Badge
                  className='flex items-center gap-1 pr-1'
                  key={index}
                  variant='secondary'
                >
                  <span>{skill}</span>
                  <button
                    className='ml-1 rounded-full hover:bg-gray-300 focus:outline-none'
                    onClick={() => {
                      const updatedSkills = skills.filter(
                        (_, i) => i !== index
                      );
                      setValue('skills', updatedSkills);
                    }}
                    type='button'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {errors.skills && (
            <p className='text-sm text-red-500'>{errors.skills.message}</p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='city'>
            {tProfessional('city')} *
          </Label>
          <Controller
            control={control}
            name='city'
            render={({ field }) => (
              <Input
                className='border-gray-300'
                id='city'
                onChange={field.onChange}
                required
                type='text'
                value={field.value}
              />
            )}
          />
          {errors.city && (
            <p className='text-sm text-red-500'>{errors.city.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='postalCode'>
            {tProfessional('postalCode')}
          </Label>
          <Controller
            control={control}
            name='postalCode'
            render={({ field }) => (
              <Input
                className='border-gray-300'
                id='postalCode'
                onChange={field.onChange}
                type='text'
                value={field.value}
              />
            )}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Controller
          control={control}
          name='interventionZone'
          render={({ field }) => (
            <>
              <Label className='text-gray-700'>
                {tProfessional('interventionZone')} : {field.value}{' '}
                {tProfessional('km')}
              </Label>
              <div className='relative h-2 w-full rounded-full bg-gray-200'>
                <div
                  className='absolute h-full rounded-full bg-blue-500'
                  style={{ width: `${(field.value / 100) * 100}%` }}
                />
                <div
                  className='absolute right-0 h-full rounded-full bg-green-200'
                  style={{
                    width: `${((100 - field.value) / 100) * 100}%`,
                  }}
                />
                <input
                  className='slider absolute h-2 w-full cursor-pointer appearance-none bg-transparent'
                  max='100'
                  min='5'
                  onChange={e => field.onChange(parseInt(e.target.value))}
                  step='5'
                  style={{
                    background: 'transparent',
                  }}
                  type='range'
                  value={field.value}
                />
              </div>
              <style jsx>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                .slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
              `}</style>
            </>
          )}
        />
      </div>

      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='phone'>
            {tProfessional('phone')} *
          </Label>
          <Controller
            control={control}
            name='phone'
            render={({ field }) => (
              <Input
                className='border-gray-300'
                id='phone'
                onChange={field.onChange}
                placeholder='06 12 34 56 78'
                required
                type='tel'
                value={field.value}
              />
            )}
          />
          {errors.phone && (
            <p className='text-sm text-red-500'>{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-gray-700' htmlFor='description'>
          {tProfessional('description')}
        </Label>
        <Controller
          control={control}
          name='description'
          render={({ field }) => (
            <textarea
              className='min-h-[120px] w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              id='description'
              onChange={field.onChange}
              placeholder='Présentez votre parcours et vos valeurs...'
              value={field.value}
            />
          )}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='yearsExperience'>
            {tProfessional('yearsExperience')}
          </Label>
          <Controller
            control={control}
            name='yearsExperience'
            render={({ field }) => (
              <Input
                className='border-gray-300'
                id='yearsExperience'
                onChange={field.onChange}
                type='number'
                value={field.value}
              />
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='hourlyRate'>
            {tProfessional('hourlyRate')} (€) *
          </Label>
          <Controller
            control={control}
            name='hourlyRate'
            render={({ field }) => (
              <Input
                className='border-gray-300'
                id='hourlyRate'
                min='1'
                onChange={e => {
                  const value = e.target.value;
                  if (value === '') {
                    field.onChange(undefined as unknown as number);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      field.onChange(numValue);
                    }
                  }
                }}
                required
                step='0.01'
                type='number'
                value={field.value ?? ''}
              />
            )}
          />
          {errors.hourlyRate && (
            <p className='text-sm text-red-500'>{errors.hourlyRate.message}</p>
          )}
        </div>
      </div>

      <div className='flex justify-between pt-4'>
        <Button
          className='border-gray-300 text-gray-700 hover:bg-gray-50'
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          ← {tCommon('previous')}
        </Button>
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600'
          onClick={onNext}
          type='button'
        >
          {tCommon('next')} →
        </Button>
      </div>
    </div>
  );
}
