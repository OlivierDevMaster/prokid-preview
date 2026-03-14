'use client';

import { AvailabilityCalendar } from '@/features/professional/components/AvailabilityCalendar';

type ProfessionalProfileCalendarSectionProps = {
  professionalId: string;
};

export function ProfessionalProfileCalendarSection({
  professionalId,
}: ProfessionalProfileCalendarSectionProps) {
  return (
    <section className='rounded-xl border border-slate-200 bg-white shadow-sm'>
      <AvailabilityCalendar professionalId={professionalId} />
    </section>
  );
}
