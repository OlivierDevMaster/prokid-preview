'use client';

import { ExternalLink, FileText } from 'lucide-react';
import { useMemo } from 'react';

import { Link } from '@/i18n/routing';

import type { MessageWithSender, ViewRole } from '../types/chat.types';

interface ReportMessageCardProps {
  isOutgoing: boolean;
  message: MessageWithSender;
  viewRole?: ViewRole;
}

export function ReportMessageCard({ isOutgoing, message, viewRole }: ReportMessageCardProps) {
  const { reportId, reportTitle } = useMemo(() => {
    try {
      const parsed = JSON.parse(message.content);
      return { reportId: parsed.reportId, reportTitle: parsed.title || 'Rapport' };
    } catch {
      return { reportId: null, reportTitle: message.content.replace(/^Rapport\s*:\s*/i, '') };
    }
  }, [message.content]);

  const reportsLink = viewRole === 'structure'
    ? '/structure/reports'
    : '/professional/reports';

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl border p-4 ${
          isOutgoing
            ? 'border-blue-200 bg-blue-50'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100'>
            <FileText className='h-5 w-5 text-blue-600' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-medium text-blue-600'>Rapport de mission</p>
            <p className='mt-0.5 text-sm font-semibold text-slate-900'>{reportTitle}</p>
            <p className='mt-1 text-xs text-slate-400'>
              {new Date(message.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                month: 'long',
              })}
            </p>
            <Link
              className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline'
              href={reportsLink}
            >
              <ExternalLink className='h-3 w-3' />
              Voir le rapport
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
