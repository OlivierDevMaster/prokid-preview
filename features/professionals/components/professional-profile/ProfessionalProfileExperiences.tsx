'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Briefcase } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

interface Props {
  professionalId: string;
}

export function ProfessionalProfileExperiences({ professionalId }: Props) {
  const { data: experiences } = useQuery({
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('professional_experiences')
        .select('*')
        .eq('user_id', professionalId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    queryKey: ['professional-experiences', professionalId],
  });

  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2]'>
          <Briefcase className='size-5' />
        </div>
        <h4 className='text-sm font-bold uppercase tracking-wider text-slate-900'>
          Exp&eacute;riences professionnelles
        </h4>
      </div>

      <div className='relative space-y-6'>
        {/* Vertical timeline line */}
        <div className='absolute bottom-0 left-[7px] top-0 w-px bg-slate-200' />

        {experiences.map((experience) => (
          <div key={experience.id} className='relative flex gap-4 pl-6'>
            {/* Timeline dot */}
            <div className='absolute left-0 top-1.5 size-[15px] rounded-full border-2 border-[#4A90E2] bg-white' />

            <div className='flex-1'>
              <p className='font-bold text-slate-900'>{experience.title}</p>
              {experience.organization && (
                <p className='text-sm font-medium text-blue-600'>
                  {experience.organization}
                </p>
              )}
              <p className='mt-1 text-sm text-slate-500'>
                {formatDateRange(experience.start_date, experience.end_date)}
              </p>
              {experience.description && (
                <p className='mt-2 text-sm leading-relaxed text-slate-600'>
                  {experience.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null
): string {
  if (!startDate) return '';

  const start = format(new Date(startDate), 'MMMM yyyy', { locale: fr });
  const capitalizedStart = start.charAt(0).toUpperCase() + start.slice(1);

  if (!endDate) {
    return `${capitalizedStart} - Aujourd'hui`;
  }

  const end = format(new Date(endDate), 'MMMM yyyy', { locale: fr });
  const capitalizedEnd = end.charAt(0).toUpperCase() + end.slice(1);

  return `${capitalizedStart} - ${capitalizedEnd}`;
}
