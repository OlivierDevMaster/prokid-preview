'use client';

import type { LucideIcon } from 'lucide-react';

import { MessageSquare, Star, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';

interface Feature {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function FeaturesSection() {
  const t = useTranslations('landing.features');

  const features: Feature[] = [
    {
      description: t('items.maxVisibility.description'),
      icon: Star,
      title: t('items.maxVisibility.title'),
    },
    {
      description: t('items.qualifiedRequests.description'),
      icon: Users,
      title: t('items.qualifiedRequests.title'),
    },
    {
      description: t('items.integratedMessaging.description'),
      icon: MessageSquare,
      title: t('items.integratedMessaging.title'),
    },
    {
      description: t('items.simpleAnalytics.description'),
      icon: TrendingUp,
      title: t('items.simpleAnalytics.title'),
    },
  ];

  return (
    <section className='bg-white py-20 lg:py-32'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            {t('title')}
          </h2>
          <p className='mt-4 text-lg text-gray-600'>{t('subtitle')}</p>
        </div>
        <div className='mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                className='flex flex-col items-center p-6 text-center transition-shadow hover:shadow-lg'
                key={index}
              >
                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-50'>
                  <Icon className='h-8 w-8 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {feature.title}
                </h3>
                <p className='mt-2 text-sm text-gray-600'>
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
