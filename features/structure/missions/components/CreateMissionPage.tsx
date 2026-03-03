'use client';

import type { Professional } from '@/features/professionals/professional.model';

import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

import { MissionRecipient } from './MissionRecipient';

export function CreateMissionPage() {
  const { selectedProfessionalIds } = useSelectedProfessional();
  const { data } = useFindProfessionals({}, { limit: 1000, page: 1 });

  const allProfessionals: Professional[] = data?.data ?? [];

  const recipients = allProfessionals.filter(professional =>
    selectedProfessionalIds.has(professional.user_id)
  );

  return (
    <div className='min-h-screen bg-blue-50/30 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto flex max-w-3xl flex-col gap-6'>
        <header className='space-y-2'>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Nouvelle mission
          </h1>

          {recipients.length > 0 && (
            <div className='flex flex-wrap items-center gap-2 text-sm'>
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
      </div>
    </div>
  );
}
