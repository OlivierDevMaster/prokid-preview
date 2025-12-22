'use client';

import { useTranslations } from 'next-intl';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  answer: string;
  question: string;
}

export function FAQSection() {
  const t = useTranslations('landing.faq');

  const faqItems: FAQItem[] = [
    {
      answer: t('items.whoCanUse.answer'),
      question: t('items.whoCanUse.question'),
    },
    {
      answer: t('items.professionalTypes.answer'),
      question: t('items.professionalTypes.question'),
    },
    {
      answer: t('items.publicStructures.answer'),
      question: t('items.publicStructures.question'),
    },
    {
      answer: t('items.freeTrial.answer'),
      question: t('items.freeTrial.question'),
    },
    {
      answer: t('items.automaticAppointments.answer'),
      question: t('items.automaticAppointments.question'),
    },
    {
      answer: t('items.payments.answer'),
      question: t('items.payments.question'),
    },
    {
      answer: t('items.availability.answer'),
      question: t('items.availability.question'),
    },
  ];

  return (
    <section className='bg-[#F8FDFB] py-20 lg:py-32'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        <h2 className='mb-12 text-center text-3xl font-bold tracking-tight text-[#34495E] sm:text-4xl'>
          {t('title')}
        </h2>
        <Accordion className='space-y-3' collapsible type='single'>
          {faqItems.map((item, index) => (
            <AccordionItem
              className='rounded-lg border border-[#DCF0E9] bg-white px-6 transition-colors data-[state=open]:bg-[#ECF8F4]'
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger className='text-left font-semibold text-[#34495E] hover:no-underline'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='text-[#56616C]'>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
