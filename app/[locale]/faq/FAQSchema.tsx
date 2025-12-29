import { getTranslations } from 'next-intl/server';

import { FAQPageSchema } from '@/lib/seo/structured-data';

export async function FAQSchema({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'faq' });

  const faqItems = [
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

  return <FAQPageSchema faqItems={faqItems} />;
}
