import { AccountForm } from '@/features/sign-up/account/AccountForm';

export default function ProfessionalAccountSignUpPage() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-xl'>
        <AccountForm role='professional' />
      </div>
    </div>
  );
}
