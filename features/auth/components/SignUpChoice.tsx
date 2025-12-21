'use client';

import { Building2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from '@/i18n/routing';

export function SignUpChoice({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations('auth.signUp');
  const router = useRouter();

  const handleProfessionalSignUp = () => {
    router.push('/auth/sign-up/professional/account');
  };

  const handleStructureSignUp = () => {
    router.push('/auth/sign-up/structure/account');
  };

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <Card className='bg-white shadow-lg transition-shadow hover:shadow-xl'>
        <CardContent className='flex flex-col items-center space-y-6 p-8 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
            <User className='h-8 w-8 text-gray-700' />
          </div>
          <div className='flex-1 space-y-3'>
            <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-gray-800'>
              👨‍🎓 {t('professional.title')}
            </h2>
            <p className='text-sm leading-relaxed text-gray-500'>
              {t('professional.roles')}
            </p>
            <p className='mt-4 text-sm text-gray-600'>
              {t('professional.benefit')}
            </p>
          </div>
          <Button
            className='w-full bg-blue-500 text-white hover:bg-blue-600'
            onClick={handleProfessionalSignUp}
          >
            {t('professional.button')}
          </Button>
        </CardContent>
      </Card>

      <Card className='bg-white shadow-lg transition-shadow hover:shadow-xl'>
        <CardContent className='flex h-full flex-col items-center space-y-6 p-8 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
            <Building2 className='h-8 w-8 text-gray-700' />
          </div>
          <div className='flex-1 space-y-3'>
            <h2 className='flex items-center justify-center gap-2 text-2xl font-bold text-gray-800'>
              🏠 {t('structure.title')}
            </h2>
            <p className='text-sm leading-relaxed text-gray-500'>
              {t('structure.types')}
            </p>
            <p className='mt-4 text-sm text-gray-600'>
              {t('structure.benefit')}
            </p>
          </div>
          <Button
            className='w-full bg-blue-500 text-white hover:bg-blue-600'
            onClick={handleStructureSignUp}
          >
            {t('structure.button')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
