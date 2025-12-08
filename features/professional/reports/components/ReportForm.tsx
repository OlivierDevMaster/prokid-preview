'use client';

import { ArrowLeft, FileText, Link, Paperclip, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import useGetStructures from '../../structures/hooks/useGetStructures';
import { useReportForm } from '../hooks/useReportForm';

export function ReportForm() {
  const t = useTranslations('admin.report');
  const { form, isLoading, onSubmit } = useReportForm();
  const { data: structures } = useGetStructures();

  return (
    <Form {...form}>
      <form className='space-y-6' onSubmit={onSubmit}>
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Link href='/admin/report'>
                <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
              </Link>
              <h1 className='text-3xl font-bold text-blue-600'>{t('title')}</h1>
            </div>
            <div className='flex gap-3'>
              <Button
                className='border-gray-300 text-gray-700 hover:bg-gray-50'
                disabled={isLoading}
                type='submit'
                variant='outline'
              >
                <FileText className='mr-2 h-4 w-4' />
                {t('saveDraft')}
              </Button>
              <Button className='bg-blue-500 text-white hover:bg-blue-600'>
                <Send className='mr-2 h-4 w-4' />
                {t('sendEmail')}
              </Button>
            </div>
          </div>

          {/* Form Card */}
          <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
            <div className='p-8'>
              <h2 className='mb-6 text-2xl font-bold text-gray-800'>
                {t('newReport')}
              </h2>
              {/* Title Section */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-semibold text-gray-700'>
                        {t('reportTitle')}{' '}
                        <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customTitlePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Recipient Structure */}
                <FormField
                  control={form.control}
                  name='recipient_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-semibold text-gray-700'>
                        {t('recipientStructure')}{' '}
                        <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectStructure')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(structures ?? []).map(structure => (
                            <SelectItem
                              key={structure.user_id}
                              value={structure.user_id}
                            >
                              {structure.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Report Content */}
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-semibold text-gray-700'>
                      {t('reportContent')}{' '}
                      <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className='min-h-[300px] resize-y'
                        placeholder={t('contentPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <div className='mt-2 text-sm text-gray-600'>
                      <p className='mb-2 font-medium'>
                        {t('exampleStructure')}
                      </p>
                      <ul className='list-inside list-disc space-y-1 text-gray-500'>
                        <li>{t('example1')}</li>
                        <li>{t('example2')}</li>
                        <li>{t('example3')}</li>
                        <li>{t('example4')}</li>
                        <li>{t('example5')}</li>
                      </ul>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('attachments')}{' '}
                  <span className='text-gray-500'>({t('optional')})</span>
                </label>
                <div className='flex items-center gap-4'>
                  <Button
                    className='border-gray-300 text-gray-700 hover:bg-gray-50'
                    disabled
                    type='button'
                    variant='outline'
                  >
                    <Paperclip className='mr-2 h-4 w-4' />
                    {t('addFiles')}
                  </Button>
                  <span className='text-sm text-gray-500'>
                    {t('fileTypes')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </Form>
  );
}
