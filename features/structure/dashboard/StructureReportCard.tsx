'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText } from 'lucide-react';
import Image from 'next/image';

import type { Report } from '@/features/reports/report.model';

import { Link } from '@/i18n/routing';

interface StructureReportCardProps {
  report: Report;
}

export function StructureReportCard({ report }: StructureReportCardProps) {
  const formattedDate = report.created_at
    ? format(new Date(report.created_at), 'd MMM yyyy', { locale: fr })
    : '';

  const firstName = report.author?.profile?.first_name || '';
  const lastName = report.author?.profile?.last_name || '';
  const professionalName = `${firstName} ${lastName}`.trim() || report.author?.profile?.email || '';
  const avatarUrl = report.author?.profile?.avatar_url;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

  return (
    <Link
      className='flex items-center gap-4 p-4 transition-colors hover:bg-slate-50'
      href={`/structure/reports?reportId=${report.id}`}
    >
      {/* Author avatar */}
      <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100'>
        {avatarUrl ? (
          <Image
            alt={professionalName}
            className='h-full w-full object-cover'
            height={40}
            src={avatarUrl}
            unoptimized
            width={40}
          />
        ) : (
          <span className='text-sm font-semibold text-blue-600'>{initials}</span>
        )}
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <h3 className='truncate text-sm font-semibold text-slate-900'>
          {report.title}
        </h3>
        <p className='mt-0.5 text-xs text-slate-500'>
          {professionalName}
          {formattedDate && ` • ${formattedDate}`}
        </p>
      </div>

      {/* Icon */}
      <FileText className='h-4 w-4 shrink-0 text-slate-300' />
    </Link>
  );
}
