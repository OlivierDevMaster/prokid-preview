'use client';

import { useTranslations } from 'next-intl';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQPage() {
  const t = useTranslations('faq');

  const faqItems = [
    {
      answer: t('items.whoCanUse.answer'),
      key: 'whoCanUse',
      question: t('items.whoCanUse.question'),
    },
    {
      answer: t('items.professionalTypes.answer'),
      key: 'professionalTypes',
      question: t('items.professionalTypes.question'),
    },
    {
      answer: t('items.publicStructures.answer'),
      key: 'publicStructures',
      question: t('items.publicStructures.question'),
    },
    {
      answer: t('items.freeTrial.answer'),
      key: 'freeTrial',
      question: t('items.freeTrial.question'),
    },
    {
      answer: t('items.automaticAppointments.answer'),
      key: 'automaticAppointments',
      question: t('items.automaticAppointments.question'),
    },
    {
      answer: t('items.payments.answer'),
      key: 'payments',
      question: t('items.payments.question'),
    },
    {
      answer: t('items.availability.answer'),
      key: 'availability',
      question: t('items.availability.question'),
    },
  ];

  return (
    <main className='min-h-screen bg-green-50/30 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl'>
        <h1 className='mb-12 text-center text-3xl font-bold text-gray-700'>
          {t('title')}
        </h1>

        <Accordion
          className='space-y-3'
          collapsible
          defaultValue='whoCanUse'
          type='single'
        >
          {faqItems.map(item => (
            <AccordionItem
              className='rounded-lg border bg-white px-6 shadow-sm'
              key={item.key}
              value={item.key}
            >
              <AccordionTrigger className='py-4 text-left font-medium text-gray-800 hover:no-underline'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='pb-4 leading-relaxed text-gray-600'>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  );
}
