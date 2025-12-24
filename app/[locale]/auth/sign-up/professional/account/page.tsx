import { AccountForm } from '@/features/sign-up/account/AccountForm';

export default function ProfessionalAccountSignUpPage() {
  return (
    <div className='flex w-full items-center justify-center px-6'>
      <div className='w-full max-w-xl'>
        <AccountForm role='professional' />
      </div>
    </div>
  );
}
