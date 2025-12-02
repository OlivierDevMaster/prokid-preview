import { StructureSignUpForm } from '@/components/structure/StructureSignUpForm';

export default function StructureSignUpPage() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-2xl'>
        <StructureSignUpForm />
      </div>
    </div>
  );
}
