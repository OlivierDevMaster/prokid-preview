'use client';

import { useTranslations } from 'next-intl';

import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useGetProfessionalJobs from '@/features/professionals/hooks/useGetProfessionalJobs';

import { ProgressBar } from '../ProgressBar';

interface Step2IdentityInfoProps {
  formData: {
    city: string;
    description: string;
    email: string;
    firstName: string;
    hourlyRate: string;
    interventionZone: number;
    lastName: string;
    phone: string;
    postalCode: string;
    profession: string;
    yearsExperience: string;
  };
  onFormDataChange: (data: Partial<Step2IdentityInfoProps['formData']>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2IdentityInfo({
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
}: Step2IdentityInfoProps) {
  const t = useTranslations('professional');
  const tCommon = useTranslations('common');
  const professionalJobs = useGetProfessionalJobs();

  const handleChange = (field: string, value: number | string) => {
    onFormDataChange({ [field]: value });
  };

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
            {tCommon('label.firstName')} *
          </Label>
          <Input
            className='border-gray-300'
            id='firstName'
            onChange={e => handleChange('firstName', e.target.value)}
            required
            type='text'
            value={formData.firstName}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='lastName'>
            {tCommon('label.lastName')} *
          </Label>
          <Input
            className='border-gray-300'
            id='lastName'
            onChange={e => handleChange('lastName', e.target.value)}
            required
            type='text'
            value={formData.lastName}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-gray-700' htmlFor='profession'>
          {tCommon('label.profession')} *
        </Label>
        <div className='w-full'>
          <MultiSelect
            animationConfig={{
              badgeAnimation: 'fade',
              popoverAnimation: 'scale',
            }}
            className='w-full'
            hideSelectAll={true}
            onValueChange={value => console.log(value)}
            options={professionalJobs}
            placeholder='Select without search'
            searchable={false}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='city'>
            Ville *
          </Label>
          <Input
            className='border-gray-300'
            id='city'
            onChange={e => handleChange('city', e.target.value)}
            required
            type='text'
            value={formData.city}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='postalCode'>
            Code postal
          </Label>
          <Input
            className='border-gray-300'
            id='postalCode'
            onChange={e => handleChange('postalCode', e.target.value)}
            type='text'
            value={formData.postalCode}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-gray-700'>
          Zone d&apos;intervention : {formData.interventionZone} km
        </Label>
        <div className='relative h-2 w-full rounded-full bg-gray-200'>
          <div
            className='absolute h-full rounded-full bg-blue-500'
            style={{ width: `${(formData.interventionZone / 100) * 100}%` }}
          />
          <div
            className='absolute right-0 h-full rounded-full bg-green-200'
            style={{
              width: `${((100 - formData.interventionZone) / 100) * 100}%`,
            }}
          />
          <input
            className='slider absolute h-2 w-full cursor-pointer appearance-none bg-transparent'
            max='100'
            min='5'
            onChange={e =>
              handleChange('interventionZone', parseInt(e.target.value))
            }
            step='5'
            style={{
              background: 'transparent',
            }}
            type='range'
            value={formData.interventionZone}
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
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='email'>
            Email professionnel *
          </Label>
          <Input
            className='border-gray-300'
            id='email'
            onChange={e => handleChange('email', e.target.value)}
            required
            type='email'
            value={formData.email}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='phone'>
            Téléphone
          </Label>
          <Input
            className='border-gray-300'
            id='phone'
            onChange={e => handleChange('phone', e.target.value)}
            placeholder='06 12 34 56 78'
            type='tel'
            value={formData.phone}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-gray-700' htmlFor='description'>
          Description
        </Label>
        <textarea
          className='min-h-[120px] w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
          id='description'
          onChange={e => handleChange('description', e.target.value)}
          placeholder='Présentez votre parcours et vos valeurs...'
          value={formData.description}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='yearsExperience'>
            Années d&apos;expérience
          </Label>
          <Input
            className='border-gray-300'
            id='yearsExperience'
            onChange={e => handleChange('yearsExperience', e.target.value)}
            type='number'
            value={formData.yearsExperience}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-gray-700' htmlFor='hourlyRate'>
            Tarif horaire (€)
          </Label>
          <Input
            className='border-gray-300'
            id='hourlyRate'
            onChange={e => handleChange('hourlyRate', e.target.value)}
            type='number'
            value={formData.hourlyRate}
          />
        </div>
      </div>

      <div className='flex justify-between pt-4'>
        <Button
          className='border-gray-300 text-gray-700 hover:bg-gray-50'
          onClick={onPrevious}
          type='button'
          variant='outline'
        >
          ← Précédent
        </Button>
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600'
          onClick={onNext}
          type='button'
        >
          Suivant →
        </Button>
      </div>
    </div>
  );
}
