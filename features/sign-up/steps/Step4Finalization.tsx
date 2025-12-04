'use client';

import { Button } from '@/components/ui/button';

import { ProgressBar } from '../ProgressBar';

interface Step4FinalizationProps {
  onPrevious: () => void;
  onSubmit: () => void;
}

export function Step4Finalization({
  onPrevious,
  onSubmit,
}: Step4FinalizationProps) {
  return (
    <div className='space-y-6'>
      <ProgressBar currentStep={4} totalSteps={4} />

      <div className='space-y-4 text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>Finalisation</h1>
        <p className='text-gray-600'>
          Vérifiez vos informations avant de finaliser votre inscription
        </p>
      </div>

      <div className='space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-6'>
        <h3 className='font-semibold text-gray-900'>
          Votre profil est presque prêt !
        </h3>
        <p className='text-sm text-gray-600'>
          En cliquant sur &quot;Finaliser&quot;, vous acceptez nos conditions
          d&apos;utilisation et notre politique de confidentialité.
        </p>
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
          onClick={onSubmit}
          type='button'
        >
          Finaliser l&apos;inscription
        </Button>
      </div>
    </div>
  );
}
