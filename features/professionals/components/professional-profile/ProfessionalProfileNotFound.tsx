import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

type ProfessionalProfileNotFoundProps = {
  backLabel: string;
  title: string;
};

export function ProfessionalProfileNotFound({
  backLabel,
  title,
}: ProfessionalProfileNotFoundProps) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-[#f6f6f8] px-4'>
      <div className='w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm'>
        <h1 className='mb-4 text-2xl font-bold text-slate-900'>{title}</h1>
        <Link href='/professionals'>
          <Button className='bg-[#4A90E2] hover:bg-[#357ABD]'>
            {backLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
