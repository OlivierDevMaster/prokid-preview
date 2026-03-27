'use client';

import { MessageSquareQuote } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function RecommendationsPlaceholder() {
  return (
    <section className='rounded-xl bg-white p-6 shadow-sm'>
      <h2 className='mb-4 flex items-center gap-2 text-xl font-bold'>
        <MessageSquareQuote className='size-6 text-blue-600' />
        Recommandations
      </h2>

      <div className='py-8 text-center'>
        <p className='text-sm text-slate-500'>
          La fonctionnalité de recommandations sera bientôt disponible.
          Vous pourrez demander à vos collègues et partenaires de rédiger
          des recommandations visibles sur votre profil.
        </p>
        <Button
          className='mt-4 h-10 rounded-xl border-slate-200'
          disabled
          variant='outline'
        >
          Demander une recommandation
        </Button>
      </div>
    </section>
  );
}
