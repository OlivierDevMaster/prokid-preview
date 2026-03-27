'use client';

import { FileText, Loader2, Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { uploadReportAttachment } from '@/features/report-attachments/report-attachment.service';
import { createClient } from '@/lib/supabase/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

interface ReportFormDialogProps {
  conversationId: string;
  missionId: string;
  onClose: () => void;
  onSuccess: (reportId: string) => void;
  open: boolean;
  userId: string;
}

export function ReportFormDialog({
  conversationId,
  missionId,
  onClose,
  onSuccess,
  open,
  userId,
}: ReportFormDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = newFiles.filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} dépasse la taille maximale de 10 Mo`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles].slice(0, MAX_FILES));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Veuillez remplir le titre et le contenu');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();

      // 1. Create the report
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          author_id: userId,
          content: content.trim(),
          mission_id: missionId,
          status: 'sent',
          title: title.trim(),
        })
        .select('id')
        .single();

      if (reportError) throw reportError;

      // 2. Upload attachments
      if (files.length > 0) {
        await Promise.allSettled(
          files.map(file =>
            uploadReportAttachment({ file, reportId: report.id })
          )
        );
      }

      // 3. Send a message of type 'report' in the conversation
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          content: `Rapport : ${title.trim()}`,
          conversation_id: conversationId,
          report_id: report.id,
          sender_id: userId,
          type: 'report',
        });

      if (messageError) throw messageError;

      toast.success('Rapport envoyé');
      setTitle('');
      setContent('');
      setFiles([]);
      onSuccess(report.id);
      onClose();
    } catch {
      toast.error("Erreur lors de l'envoi du rapport");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setContent('');
      setFiles([]);
      onClose();
    }
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5 text-blue-600' />
            Rédiger un rapport
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label className='text-xs font-medium text-slate-600'>
              Titre du rapport *
            </Label>
            <Input
              className='mt-1 h-10 rounded-xl border-slate-200'
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Rapport d'intervention - 31 mars"
              value={title}
            />
          </div>

          <div>
            <Label className='text-xs font-medium text-slate-600'>
              Contenu du rapport *
            </Label>
            <Textarea
              className='mt-1 min-h-[150px] rounded-xl border-slate-200'
              onChange={e => setContent(e.target.value)}
              placeholder='Décrivez le déroulement de la journée, les activités réalisées, les observations...'
              value={content}
            />
          </div>

          {/* File attachments */}
          <div>
            <Label className='text-xs font-medium text-slate-600'>
              Pièces jointes ({files.length}/{MAX_FILES})
            </Label>

            {files.length > 0 && (
              <div className='mt-2 space-y-2'>
                {files.map((file, index) => (
                  <div
                    className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'
                    key={`${file.name}-${index}`}
                  >
                    <div className='flex items-center gap-2 truncate'>
                      <Paperclip className='h-3.5 w-3.5 shrink-0 text-slate-400' />
                      <span className='truncate text-sm text-slate-700'>{file.name}</span>
                      <span className='shrink-0 text-xs text-slate-400'>
                        {(file.size / 1024).toFixed(0)} Ko
                      </span>
                    </div>
                    <button
                      className='shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                      onClick={() => removeFile(index)}
                      type='button'
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length < MAX_FILES && (
              <button
                className='mt-2 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600'
                onClick={() => fileInputRef.current?.click()}
                type='button'
              >
                <Paperclip className='h-4 w-4' />
                Ajouter un fichier
              </button>
            )}

            <input
              accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp'
              className='hidden'
              multiple
              onChange={handleAddFiles}
              ref={fileInputRef}
              type='file'
            />
            <p className='mt-1 text-xs text-slate-400'>
              PDF, Word, images. Max 10 Mo par fichier.
            </p>
          </div>
        </div>

        <DialogFooter className='flex gap-2'>
          <Button
            className='h-10 rounded-xl'
            disabled={isSubmitting}
            onClick={handleClose}
            variant='outline'
          >
            Annuler
          </Button>
          <Button
            className='h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700'
            disabled={isSubmitting || !title.trim() || !content.trim()}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <FileText className='mr-2 h-4 w-4' />
            )}
            Envoyer le rapport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
