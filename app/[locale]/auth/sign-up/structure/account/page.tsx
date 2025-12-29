import { AccountForm } from '@/features/sign-up/account/AccountForm';

export default function StructureAccountSignUpPage() {
  return (
    <div className='flex w-full items-center justify-center md:px-6'>
      <div className='w-full max-w-xl'>
        <AccountForm role='structure' />
      </div>
    </div>
  );
}
