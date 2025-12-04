'use client';

import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Twitter,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('footer');
  const title = useTranslations('title');

  return (
    <footer className='bg-slate-800 text-white'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='py-12'>
          <div className='mb-8 text-center'>
            <h3 className='mb-2 text-2xl font-bold'>{title('project')}</h3>
            <p className='mb-4 text-sm text-slate-300'>{t('tagline')}</p>
            <p className='mx-auto max-w-2xl text-sm text-slate-200'>
              {t('description')}
            </p>
          </div>

          <div className='mt-12 grid grid-cols-1 gap-8 md:grid-cols-5'>
            <div className='space-y-4'>
              <h4 className='text-sm font-semibold'>{t('forStructures')}</h4>
              <ul className='space-y-2 text-sm text-slate-300'>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/find-professional'
                  >
                    {t('findProfessional')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/how-it-works'
                  >
                    {t('howItWorks')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/pricing'
                  >
                    {t('pricing')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <h4 className='text-sm font-semibold'>{t('forProfessionals')}</h4>
              <ul className='space-y-2 text-sm text-slate-300'>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/become-visible'
                  >
                    {t('becomeVisible')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/referencing'
                  >
                    {t('referencing')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/free-trial'
                  >
                    {t('freeTrial')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <h4 className='text-sm font-semibold'>{t('resources')}</h4>
              <ul className='space-y-2 text-sm text-slate-300'>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/blog'
                  >
                    {t('blog')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/job-guides'
                  >
                    {t('jobGuides')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/help-center'
                  >
                    {t('helpCenter')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <h4 className='text-sm font-semibold'>{t('legal')}</h4>
              <ul className='space-y-2 text-sm text-slate-300'>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/terms'
                  >
                    {t('terms')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/privacy'
                  >
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <Link
                    className='transition-colors hover:text-white'
                    href='/legal-notices'
                  >
                    {t('legalNotices')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <h4 className='text-sm font-semibold'>{t('contact')}</h4>
              <ul className='space-y-3 text-sm text-slate-300'>
                <li className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  <a
                    className='transition-colors hover:text-white'
                    href={`mailto:${t('email')}`}
                  >
                    {t('email')}
                  </a>
                </li>
                <li className='flex items-start gap-2'>
                  <MapPin className='mt-0.5 h-4 w-4' />
                  <span>{t('address')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='border-t border-slate-700 py-8'>
          <div className='flex flex-col items-center justify-center gap-8 lg:flex-row'>
            <div className='max-w-md flex-1'>
              <h4 className='mb-2 text-sm font-semibold'>{t('newsletter')}</h4>
              <p className='mb-4 text-sm text-slate-300'>
                {t('newsletterDescription')}
              </p>
              <form className='flex gap-2'>
                <Input
                  className='border-slate-600 bg-slate-700 text-white placeholder:text-slate-400'
                  placeholder={t('emailPlaceholder')}
                  type='email'
                />
                <Button
                  className='bg-green-500 text-white hover:bg-green-600'
                  type='submit'
                >
                  {t('subscribe')}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className='border-t border-slate-700 py-6'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='flex gap-4'>
              <a
                aria-label='Facebook'
                className='text-slate-300 transition-colors hover:text-white'
                href='https://facebook.com'
                rel='noopener noreferrer'
                target='_blank'
              >
                <Facebook className='h-5 w-5' />
              </a>
              <a
                aria-label='Twitter'
                className='text-slate-300 transition-colors hover:text-white'
                href='https://twitter.com'
                rel='noopener noreferrer'
                target='_blank'
              >
                <Twitter className='h-5 w-5' />
              </a>
              <a
                aria-label='LinkedIn'
                className='text-slate-300 transition-colors hover:text-white'
                href='https://linkedin.com'
                rel='noopener noreferrer'
                target='_blank'
              >
                <Linkedin className='h-5 w-5' />
              </a>
              <a
                aria-label='Instagram'
                className='text-slate-300 transition-colors hover:text-white'
                href='https://instagram.com'
                rel='noopener noreferrer'
                target='_blank'
              >
                <Instagram className='h-5 w-5' />
              </a>
            </div>
            <p className='text-sm text-slate-300'>{t('copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
