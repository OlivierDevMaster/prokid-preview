'use client';

import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
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
import { createClient } from '@/lib/supabase/client';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // 2. Send a message of type 'report' in the conversation
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
      onSuccess(report.id);
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'envoi du rapport");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
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
        </div>

        <DialogFooter className='flex gap-2'>
          <Button
            className='h-10 rounded-xl'
            onClick={onClose}
            variant='outline'
          >
            Annuler
          </Button>
          <Button
            className='h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700'
            disabled={isSubmitting}
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
