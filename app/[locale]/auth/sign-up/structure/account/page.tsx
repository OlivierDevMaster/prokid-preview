import { AccountForm } from '@/features/sign-up/account/AccountForm';

export default function StructureAccountSignUpPage() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-xl'>
        <AccountForm role='structure' />
      </div>
    </div>
  );
}
