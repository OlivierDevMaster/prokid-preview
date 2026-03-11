'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { Professional } from '@/features/professionals/professional.model';

import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

import { MissionRecipient } from './MissionRecipient';
import { MissionPropositionForm } from './MissionPropositionForm';

export function CreateMissionPage() {
  const router = useRouter();
  const { selectedProfessionalIds } = useSelectedProfessional();
  const { data } = useFindProfessionals({}, { limit: 1000, page: 1 });

  const allProfessionals: Professional[] = data?.data ?? [];

  const recipients = allProfessionals.filter(professional =>
    selectedProfessionalIds.has(professional.user_id)
  );

  return (
    <div className='min-h-screen bg-blue-50/30 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6'>
        <header className=''>
          <button
            className='inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-500'
            onClick={() => router.back()}
            type='button'
          >
            <ChevronLeft className='h-4 w-4' />
            <span>Retour</span>
          </button>

          <h1 className='mt-2 text-2xl font-bold text-gray-900 sm:text-3xl'>
            Nouvelle mission
          </h1>

          {recipients.length > 0 && (
            <div className='mt-8 flex flex-wrap items-center gap-2 text-sm'>
              <span className='text-gray-600'>Destinataire :</span>
              <div className='flex flex-wrap gap-2'>
                {recipients.map(professional => (
                  <MissionRecipient
                    key={professional.user_id}
                    professional={professional}
                  />
                ))}
              </div>
            </div>
          )}
        </header>
        <MissionPropositionForm/>
      </div>
    </div>
  );
}
