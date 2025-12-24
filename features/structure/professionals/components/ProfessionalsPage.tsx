'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';

import { useGetProfessionals } from '../hooks/useGetProfessionals';
import { ProfessionalCard } from './ProfessionalCard';

export function ProfessionalsPage() {
  const t = useTranslations('structure.professionals');
  const router = useRouter();
  const { data: professionalsData, isLoading } = useGetProfessionals();

  const professionals = professionalsData?.data ?? [];

  const handleAddMission = () => {
    router.push('/structure/invitations/new');
  };

  if (isLoading) {
    return (
      <div className='-m-8 flex min-h-screen items-center justify-center bg-blue-50/30 p-8'>
        <p className='text-gray-600'>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('description')}</p>
      </div>

      <div className='flex justify-end gap-3'>
        <Button
          className='rounded-lg bg-blue-400 text-white hover:bg-blue-500'
          onClick={handleAddMission}
        >
          <Plus className='mr-2 h-4 w-4' />
          {t('sendInvitation')}
        </Button>
      </div>
      {/* Professionals Grid */}
      {professionals.length > 0 ? (
        <div className='grid grid-cols-1 grid-cols-2 gap-6'>
          {professionals.map(professional => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
            />
          ))}
        </div>
      ) : (
        <div className='py-12 text-center text-gray-500'>
          <p>{t('noProfessionals')}</p>
        </div>
      )}
    </div>
  );
}
