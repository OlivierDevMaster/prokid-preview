'use client';

import { ArrowLeft, FileText, Paperclip, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/i18n/routing';

export function ReportPage() {
  const t = useTranslations('admin.report');
  const [title, setTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('');
  const [content, setContent] = useState('');

  const handleSaveDraft = () => {
    // Logique pour enregistrer le brouillon
    console.log('Saving draft...');
  };

  const handleSendEmail = () => {
    // Logique pour envoyer par e-mail
    console.log('Sending by email...');
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/admin'>
            <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
          </Link>
          <h1 className='text-3xl font-bold text-blue-600'>{t('title')}</h1>
        </div>
        <div className='flex gap-3'>
          <Button
            className='border-gray-300 text-gray-700 hover:bg-gray-50'
            onClick={handleSaveDraft}
            variant='outline'
          >
            <FileText className='mr-2 h-4 w-4' />
            {t('saveDraft')}
          </Button>
          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            onClick={handleSendEmail}
          >
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

          <div className='space-y-6'>
            {/* Title Section */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label
                  className='text-sm font-semibold text-gray-700'
                  htmlFor='report-title'
                >
                  {t('reportTitle')} <span className='text-red-500'>*</span>
                </Label>
                <Select onValueChange={setTitle} value={title}>
                  <SelectTrigger id='report-title'>
                    <SelectValue placeholder={t('selectTemplate')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='template1'>{t('template1')}</SelectItem>
                    <SelectItem value='template2'>{t('template2')}</SelectItem>
                    <SelectItem value='template3'>{t('template3')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className='mt-2'
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder={t('customTitlePlaceholder')}
                  value={customTitle}
                />
              </div>

              {/* Recipient Structure */}
              <div className='space-y-2'>
                <Label
                  className='text-sm font-semibold text-gray-700'
                  htmlFor='structure'
                >
                  {t('recipientStructure')}{' '}
                  <span className='text-red-500'>*</span>
                </Label>
                <Select
                  onValueChange={setSelectedStructure}
                  value={selectedStructure}
                >
                  <SelectTrigger id='structure'>
                    <SelectValue placeholder={t('selectStructure')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='mam-soleil'>MAM Soleil</SelectItem>
                    <SelectItem value='structure2'>
                      {t('structure2')}
                    </SelectItem>
                    <SelectItem value='structure3'>
                      {t('structure3')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Report Content */}
            <div className='space-y-2'>
              <Label
                className='text-sm font-semibold text-gray-700'
                htmlFor='content'
              >
                {t('reportContent')} <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                className='min-h-[300px] resize-y'
                id='content'
                onChange={e => setContent(e.target.value)}
                placeholder={t('contentPlaceholder')}
                value={content}
              />
              <div className='mt-2 text-sm text-gray-600'>
                <p className='mb-2 font-medium'>{t('exampleStructure')}</p>
                <ul className='list-inside list-disc space-y-1 text-gray-500'>
                  <li>{t('example1')}</li>
                  <li>{t('example2')}</li>
                  <li>{t('example3')}</li>
                  <li>{t('example4')}</li>
                  <li>{t('example5')}</li>
                </ul>
              </div>
            </div>

            {/* Attachments */}
            <div className='space-y-2'>
              <Label className='text-sm font-semibold text-gray-700'>
                {t('attachments')}{' '}
                <span className='text-gray-500'>({t('optional')})</span>
              </Label>
              <div className='flex items-center gap-4'>
                <Button
                  className='border-gray-300 text-gray-700 hover:bg-gray-50'
                  type='button'
                  variant='outline'
                >
                  <Paperclip className='mr-2 h-4 w-4' />
                  {t('addFiles')}
                </Button>
                <span className='text-sm text-gray-500'>{t('fileTypes')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
