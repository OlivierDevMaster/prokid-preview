'use client';

import { FileText, Paperclip } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client';

import type { MessageWithSender } from '../types/chat.types';

interface ReportMessageCardProps {
  isOutgoing: boolean;
  message: MessageWithSender;
}

export function ReportMessageCard({ isOutgoing, message }: ReportMessageCardProps) {
  const reportTitle = message.content.replace(/^Rapport\s*:\s*/i, '');

  // Fetch attachment count if report_id exists
  const { data: attachmentCount = 0 } = useQuery({
    enabled: !!message.report_id,
    queryFn: async () => {
      if (!message.report_id) return 0;
      const supabase = createClient();
      const { count } = await supabase
        .from('report_attachments')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', message.report_id);
      return count ?? 0;
    },
    queryKey: ['report-attachments-count', message.report_id],
  });

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
            <div className='mt-2 flex items-center gap-3 text-xs text-slate-400'>
              <span>
                {new Date(message.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  month: 'long',
                })}
              </span>
              {attachmentCount > 0 && (
                <span className='flex items-center gap-1'>
                  <Paperclip className='h-3 w-3' />
                  {attachmentCount} fichier{attachmentCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
