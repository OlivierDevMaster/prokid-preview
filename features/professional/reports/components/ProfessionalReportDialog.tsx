'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import { Calendar, Download, FileDown, Paperclip, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getReportAttachmentDownloadUrl } from '@/features/report-attachments/report-attachment.service';

import { useGetProfessionalReport } from '../hooks/useGetProfessionalReport';

interface ProfessionalReportDialogProps {
  onClose: () => void;
  open: boolean;
  reportId: null | string;
}

export function ProfessionalReportDialog({
  onClose,
  open,
  reportId,
}: ProfessionalReportDialogProps) {
  const t = useTranslations('admin.report');
  const tCommon = useTranslations('common');

  const { data: reportData, isLoading } = useGetProfessionalReport(reportId);
  const report = reportData?.report;

  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<null | string>(null);

  const professionalName = report?.author?.profile
    ? `${report.author.profile.first_name || ''} ${report.author.profile.last_name || ''}`.trim() ||
      report.author.profile.email ||
      tCommon('messages.unknown')
    : tCommon('messages.unknown');

  const missionTitle = report?.mission?.title;
  const structureName = report?.mission?.structure?.name;

  const handleDownloadPdf = useCallback(() => {
    if (!report) return;

    const doc = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - margin * 2;
    const blue = [74, 144, 226] as const;

    const checkPage = (needed: number, currentY: number) => {
      if (currentY + needed > pageHeight - 25) {
        doc.addPage();
        return 25;
      }
      return currentY;
    };

    let y = 0;

    // Header band
    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('PROKID', margin, 15);
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 255);
    doc.text('RAPPORT D\'INTERVENTION', margin, 22);

    if (report.created_at) {
      doc.setFontSize(9);
      doc.setTextColor(200, 220, 255);
      doc.text(
        format(new Date(report.created_at), 'dd MMMM yyyy', { locale: fr }),
        pageWidth - margin, 15, { align: 'right' }
      );
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(report.title || 'Rapport', contentWidth);
    doc.text(titleLines, margin, 35);
    y = 58;

    // Info cards
    const cardHeight = 22;
    const cardGap = 6;
    const cardWidth = (contentWidth - cardGap) / 2;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, y, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140);
    doc.text('Professionnel', margin + 5, y + 7);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text(professionalName || '-', margin + 5, y + 15);

    const card2X = margin + cardWidth + cardGap;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(card2X, y, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140);
    doc.text('Mission', card2X + 5, y + 7);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    const mText = doc.splitTextToSize(missionTitle || '-', cardWidth - 10);
    doc.text(mText[0], card2X + 5, y + 15);
    y += cardHeight + 12;

    // Content
    doc.setDrawColor(blue[0], blue[1], blue[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 20, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blue[0], blue[1], blue[2]);
    doc.text('CONTENU DU RAPPORT', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    const contentLines = doc.splitTextToSize(report.content || '', contentWidth);
    for (const line of contentLines) {
      y = checkPage(7, y);
      doc.text(line, margin, y);
      y += 5.5;
    }

    // Attachments
    if (report.attachments && report.attachments.length > 0) {
      y += 10;
      y = checkPage(20, y);
      doc.setDrawColor(blue[0], blue[1], blue[2]);
      doc.setLineWidth(0.8);
      doc.line(margin, y, margin + 20, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(blue[0], blue[1], blue[2]);
      doc.text(`PIECES JOINTES (${report.attachments.length})`, margin, y);
      y += 8;

      report.attachments.forEach(att => {
        y = checkPage(10, y);
        doc.setFillColor(250, 250, 252);
        doc.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);
        doc.text(att.file_name || att.file_path, margin + 4, y + 2);
        y += 12;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(220);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(160);
      doc.text('ProKid — Rapport d\'intervention', margin, pageHeight - 10);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    const fileName = `rapport-${(report.title || 'rapport').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    doc.save(fileName);
  }, [report, professionalName, missionTitle]);

  const handleDownloadAttachment = async (attachmentId: string, fileName: string) => {
    try {
      setDownloadingAttachmentId(attachmentId);
      const downloadUrl = await getReportAttachmentDownloadUrl(attachmentId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body?.appendChild?.(link);
      link.click();
      document.body?.removeChild?.(link);
    } catch {
      // Silent fail
    } finally {
      setDownloadingAttachmentId(null);
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent aria-describedby={undefined} className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
        <DialogTitle className='sr-only'>Rapport</DialogTitle>
        {isLoading ? (
          <div className='space-y-4 p-8'>
            <div className='h-6 w-48 animate-pulse rounded bg-slate-200' />
            <div className='h-4 w-72 animate-pulse rounded bg-slate-100' />
            <div className='h-32 animate-pulse rounded bg-slate-100' />
          </div>
        ) : !report ? (
          <div className='py-12 text-center text-slate-500'>
            {tCommon('messages.notFound')}
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader className='border-b border-slate-200 px-6 py-5'>
              <h2 className='text-xl font-bold text-slate-900'>{report.title}</h2>
              <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500'>
                {structureName && (
                  <span className='flex items-center gap-1.5'>
                    <User className='h-3.5 w-3.5' />
                    {structureName}
                  </span>
                )}
                {missionTitle && (
                  <span className='flex items-center gap-1.5'>
                    <span className='text-slate-300'>|</span>
                    {missionTitle}
                  </span>
                )}
                {report.created_at && (
                  <span className='flex items-center gap-1.5'>
                    <Calendar className='h-3.5 w-3.5' />
                    {format(new Date(report.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                )}
              </div>
            </DialogHeader>

            {/* Body */}
            <div className='flex-1 overflow-y-auto'>
              <div className='px-6 py-6'>
                <h3 className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400'>
                  {t('label.content')}
                </h3>
                <div className='whitespace-pre-wrap text-sm leading-relaxed text-slate-700'>
                  {report.content}
                </div>
              </div>

              {report.attachments && report.attachments.length > 0 && (
                <div className='border-t border-slate-100 px-6 py-5'>
                  <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    {t('attachments')} ({report.attachments.length})
                  </h3>
                  <div className='space-y-2'>
                    {report.attachments.map(attachment => (
                      <button
                        className='flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100 disabled:opacity-50'
                        disabled={downloadingAttachmentId === attachment.id}
                        key={attachment.id}
                        onClick={() =>
                          handleDownloadAttachment(attachment.id, attachment.file_name || attachment.file_path)
                        }
                        type='button'
                      >
                        <Paperclip className='h-4 w-4 flex-shrink-0 text-slate-400' />
                        <span className='flex-1 text-sm font-medium text-slate-700'>
                          {attachment.file_name || attachment.file_path}
                        </span>
                        {downloadingAttachmentId === attachment.id ? (
                          <span className='text-xs text-slate-400'>{tCommon('messages.loading')}</span>
                        ) : (
                          <Download className='h-4 w-4 flex-shrink-0 text-slate-400' />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='flex items-center justify-between border-t border-slate-200 px-6 py-4'>
              <Button
                className='h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50'
                onClick={onClose}
              >
                Fermer
              </Button>
              <Button
                className='flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700'
                onClick={handleDownloadPdf}
              >
                <FileDown className='h-4 w-4' />
                Télécharger en PDF
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
