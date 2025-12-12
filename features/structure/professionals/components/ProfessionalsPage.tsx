'use client';

import { useTranslations } from 'next-intl';

import { useGetProfessionals } from '../hooks/useGetProfessionals';
import { ProfessionalCard } from './ProfessionalCard';

export function ProfessionalsPage() {
  const t = useTranslations('structure.professionals');
  const { data: professionalsData, isLoading } = useGetProfessionals();

  const professionals = professionalsData?.data ?? [];

  if (isLoading) {
    return (
      <div className='-m-8 flex min-h-screen items-center justify-center bg-white p-8'>
        <p className='text-gray-600'>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className='-m-8 min-h-screen space-y-6 bg-white p-8'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('description')}</p>
      </div>

      {/* Professionals Grid */}
      {professionals.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
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
