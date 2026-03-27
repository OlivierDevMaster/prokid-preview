'use client';

import { FileText } from 'lucide-react';

import type { MessageWithSender } from '../types/chat.types';

interface ReportMessageCardProps {
  isOutgoing: boolean;
  message: MessageWithSender;
}

export function ReportMessageCard({ isOutgoing, message }: ReportMessageCardProps) {
  // Extract title from content (format: "Rapport : {title}")
  const reportTitle = message.content.replace(/^Rapport\s*:\s*/i, '');

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl border p-4 ${
          isOutgoing
            ? 'border-blue-200 bg-blue-50'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className='mb-2 flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100'>
            <FileText className='h-4 w-4 text-blue-600' />
          </div>
          <div>
            <p className='text-xs font-medium text-blue-600'>Rapport de mission</p>
            <p className='text-sm font-semibold text-slate-900'>{reportTitle}</p>
          </div>
        </div>
        <p className='text-xs text-slate-400'>
          {new Date(message.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            month: 'long',
          })}
        </p>
      </div>
    </div>
  );
}
