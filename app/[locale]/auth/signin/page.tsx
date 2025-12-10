import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { SignInForm } from '@/features/auth/components/SignInForm';
import { authOptions } from '@/lib/auth';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/');
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <SignInForm />
      </div>
    </div>
  );
}
