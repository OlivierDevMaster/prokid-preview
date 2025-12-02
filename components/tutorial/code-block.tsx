'use client';

import { useState } from 'react';

import { Button } from '../ui/button';

const CopyIcon = () => (
  <svg
    fill='none'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    viewBox='0 0 24 24'
    width='20'
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect height='13' rx='2' ry='2' width='13' x='9' y='9'></rect>
    <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
  </svg>
);

const CheckIcon = () => (
  <svg
    fill='none'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    viewBox='0 0 24 24'
    width='20'
    xmlns='http://www.w3.org/2000/svg'
  >
    <polyline points='20 6 9 17 4 12'></polyline>
  </svg>
);

export function CodeBlock({ code }: { code: string }) {
  const [icon, setIcon] = useState(CopyIcon);

  const copy = async () => {
    await navigator?.clipboard?.writeText(code);
    setIcon(CheckIcon);
    setTimeout(() => setIcon(CopyIcon), 2000);
  };

  return (
    <pre className='relative my-6 rounded-md bg-muted p-6'>
      <Button
        className='absolute right-2 top-2'
        onClick={copy}
        size='icon'
        variant={'outline'}
      >
        {icon}
      </Button>
      <code className='p-3 text-xs'>{code}</code>
    </pre>
  );
}
