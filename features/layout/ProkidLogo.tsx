import Image from 'next/image';

import { cn } from '@/lib/utils';

type ProkidLogoProps = {
  className?: string;
};

export default function ProkidLogo({ className }: ProkidLogoProps) {
  return (
    <div className={cn('flex w-32 items-center', className)}>
      <Image
        alt='ProKid Logo'
        className='h-auto w-auto'
        height={40}
        src='/icons/logo.svg'
        unoptimized
        width={40}
      />
    </div>
  );
}
