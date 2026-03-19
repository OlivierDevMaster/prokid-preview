'use client';

import { LocateFixed } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useActivateStructureLocation } from '@/features/structures/hooks/useActivateStructureLocation';

export function StructureLocationActivation() {
  const t = useTranslations('professional');
  const { isLoading, onActivate, shouldShowActivateButton } =
    useActivateStructureLocation();

  if (!shouldShowActivateButton) return null;

  return (
    <div className='mt-3 flex items-center justify-center gap-3 border-t pt-3'>
      <p className='text-sm text-gray-500'>
        {t('search.useMyPositionInstruction')}
      </p>
      <Button
        className='flex items-center gap-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary'
        disabled={isLoading}
        onClick={onActivate}
        type='button'
        variant='outline'
      >
        <LocateFixed className='h-4 w-4' />
        {isLoading ? t('search.locating') : t('search.useMyPosition')}
      </Button>
    </div>
  );
}
