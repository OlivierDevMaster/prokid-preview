import { cn } from '@/lib/utils';

type ProkidLogoProps = {
  className?: string;
};

export default function ProkidLogo({ className }: ProkidLogoProps) {
  return (
    <div className={cn('font-bold text-gray-800 md:text-2xl', className)}>
      <span className='text-blue-400'>PRO</span>
      <span className='text-green-400'>Kid</span>
    </div>
  );
}
