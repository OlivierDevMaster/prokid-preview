'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';

import {
  type ReportFormData,
  reportFormSchema,
} from '../schemas/report.schema';
import { createUserReport, updateUserReport } from '../services/report.service';

export function useReportForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('admin');

  const form = useForm<ReportFormData>({
    defaultValues: {
      content: '',
      mission_id: '',
      title: '',
    },
    resolver: zodResolver(reportFormSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error(t('report.messages.unauthenticated'));
      }

      if (data.id) {
        return updateUserReport(data.id, {
          content: data.content,
          mission_id: data.mission_id,
          title: data.title,
        });
      }
      // Create report object - author_id will be set by the edge function
      // The edge function uses the authenticated user from the token
      return createUserReport({
        author_id: session.user.id, // Will be overridden by edge function, but kept for type safety
        content: data.content,
        mission_id: data.mission_id,
        title: data.title,
      });
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('report.messages.errorCreatingReport')
      );
    },
    onSuccess: data => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        toast.success(t('report.messages.reportSavedSuccessfully'));
        router.push('/professional/reports');
      } else {
        toast.error(t('report.messages.impossibleToCreateReport'));
      }
    },
  });

  const onSubmit = form.handleSubmit(data => {
    mutation.mutate(data);
  });

  return {
    form,
    isLoading: mutation.isPending,
    onSubmit,
  };
}
