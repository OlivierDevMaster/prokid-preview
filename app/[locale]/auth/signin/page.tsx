import { getServerSession } from 'next-auth';
import { getLocale } from 'next-intl/server';

import { SignInForm } from '@/features/auth/components/SignInForm';
import { redirect } from '@/i18n/routing';
import { authOptions } from '@/lib/auth';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();

  if (session) {
    redirect({ href: '/', locale });
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <SignInForm />
      </div>
    </div>
  );
}
