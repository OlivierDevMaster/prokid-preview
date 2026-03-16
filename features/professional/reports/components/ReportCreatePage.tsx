'use client';

import { HelpCircle, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { ReportForm } from './ReportForm';

export function ReportCreatePage() {
  const t = useTranslations('admin.report');

  return (
    <div className='min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6'>
        <header>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            {t('creationTitle')}
          </h1>
          <p className='mt-2 text-sm text-gray-600'>
            Veuillez renseigner les détails de votre intervention ci-dessous.
          </p>
        </header>

        <div className='flex flex-col gap-6 lg:flex-row'>
          {/* Form column */}
          <div className='min-w-0 flex-1'>
            <ReportForm />
          </div>

          {/* Guidance sidebar */}
          <aside className='w-full space-y-6 lg:w-80'>
            <Card className='border-none bg-white shadow-sm'>
              <div className='rounded-xl bg-blue-50/20 px-4 py-3 sm:px-6 sm:py-4'>
                <div className='mb-4 flex items-center gap-2 text-blue-700'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                    <Lightbulb className='h-4 w-4 text-blue-600' />
                  </span>
                  <h2 className='text-sm font-bold uppercase tracking-wide'>
                    Exemple de structure
                  </h2>
                </div>
                <div className='space-y-4'>
                  <div>
                    <p className='mb-1 text-xs font-bold text-gray-500'>
                      Introduction
                    </p>
                    <p className='text-sm text-gray-600'>
                      Contexte de la rencontre et objectifs fixés.
                    </p>
                  </div>
                  <div className='h-px bg-blue-100' />
                  <div>
                    <p className='mb-1 text-xs font-bold text-gray-500'>
                      Observations
                    </p>
                    <p className='text-sm text-gray-600'>
                      Faits marquants, comportement de l&apos;enfant, échanges
                      significatifs.
                    </p>
                  </div>
                  <div className='h-px bg-blue-100' />
                  <div>
                    <p className='mb-1 text-xs font-bold text-gray-500'>
                      Analyse
                    </p>
                    <p className='text-sm text-gray-600'>
                      Interprétation professionnelle de la situation.
                    </p>
                  </div>
                  <div className='h-px bg-blue-100' />
                  <div>
                    <p className='mb-1 text-xs font-bold text-gray-500'>
                      Perspectives
                    </p>
                    <p className='text-sm text-gray-600'>
                      Recommandations pour les prochaines étapes.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
