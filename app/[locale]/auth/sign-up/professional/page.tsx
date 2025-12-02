import { ProfessionalSignUpForm } from '@/components/professional/professional-sign-up-form';

export default function ProfessionalSignUpPage() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-2xl'>
        <ProfessionalSignUpForm />
      </div>
    </div>
  );
}
