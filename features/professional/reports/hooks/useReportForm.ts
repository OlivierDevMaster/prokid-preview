'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import type { ReportInsert } from '@/features/reports/report.model';

import { useUploadReportAttachment } from '@/features/report-attachments';
import { useCreateReport } from '@/features/reports/hooks';
import { createClient } from '@/lib/supabase/client';

import {
  type ReportFormData,
  reportFormSchema,
} from '../schemas/report.schema';

export function useReportForm() {
  const t = useTranslations('admin');

  const form = useForm<ReportFormData>({
    defaultValues: {
      content: '',
      mission_id: '',
      title: '',
    },
    resolver: zodResolver(reportFormSchema),
  });

  const sendReportMutation = useCreateReport();
  const { mutate: uploadAttachment } = useUploadReportAttachment();

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      return undefined;
    }

    const data = form.getValues();
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      throw new Error(t('report.messages.unauthenticated'));
    }

    const authorId = session.user.id;
    const { files, ...rest } = data;
    const parsedData: ReportInsert = {
      ...rest,
      author_id: authorId,
      status: 'draft',
    };

    const result = await sendReportMutation.mutateAsync(parsedData);

    if (files && files.length > 0) {
      await handleUploadFiles(result.id, files);
    }

    return result;
  };

  const handleUploadFiles = async (reportId: string, selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    // Upload files one by one (since useUploadReportAttachment only accepts one file)
    for (const file of selectedFiles) {
      try {
        await new Promise<void>((resolve, reject) => {
          uploadAttachment(
            { file, reportId },
            {
              onError: error => reject(error),
              onSuccess: () => resolve(),
            }
          );
        });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }
  };
  return {
    form,
    isLoading: sendReportMutation.isPending,
    onSubmit,
  };
}
