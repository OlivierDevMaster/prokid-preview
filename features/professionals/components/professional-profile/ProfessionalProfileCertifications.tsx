'use client';

import { useQuery } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

interface Props {
  professionalId: string;
}

export function ProfessionalProfileCertifications({ professionalId }: Props) {
  const { data: certifications } = useQuery({
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('professional_certifications')
        .select('*')
        .eq('user_id', professionalId)
        .order('year_obtained', { ascending: false });

      if (error) throw error;
      return data;
    },
    queryKey: ['professional-certifications', professionalId],
  });

  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
          <GraduationCap className='size-5' />
        </div>
        <h4 className='text-sm font-bold uppercase tracking-wider text-slate-900'>
          Dipl&ocirc;mes et certifications
        </h4>
      </div>

      <div className='space-y-4'>
        {certifications.map((certification) => (
          <div
            key={certification.id}
            className='flex items-center justify-between gap-4'
          >
            <div className='min-w-0 flex-1'>
              <p className='font-bold text-slate-900'>{certification.name}</p>
              {certification.institution && (
                <p className='text-sm text-slate-500'>
                  {certification.institution}
                </p>
              )}
            </div>
            {certification.year_obtained && (
              <span className='shrink-0 rounded-lg bg-blue-50 px-2 py-0.5 text-sm font-medium text-blue-600'>
                {certification.year_obtained}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
