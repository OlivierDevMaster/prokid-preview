import { NextLogo } from './next-logo';
import { SupabaseLogo } from './supabase-logo';

export function Hero() {
  return (
    <div className='flex flex-col items-center gap-16'>
      <div className='flex items-center justify-center gap-8'>
        <a
          href='https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs'
          rel='noreferrer'
          target='_blank'
        >
          <SupabaseLogo />
        </a>
        <span className='h-6 rotate-45 border-l' />
        <a href='https://nextjs.org/' rel='noreferrer' target='_blank'>
          <NextLogo />
        </a>
      </div>
      <h1 className='sr-only'>Supabase and Next.js Starter Template</h1>
      <p className='mx-auto max-w-xl text-center text-3xl !leading-tight lg:text-4xl'>
        The fastest way to build apps with{' '}
        <a
          className='font-bold hover:underline'
          href='https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs'
          rel='noreferrer'
          target='_blank'
        >
          Supabase
        </a>{' '}
        and{' '}
        <a
          className='font-bold hover:underline'
          href='https://nextjs.org/'
          rel='noreferrer'
          target='_blank'
        >
          Next.js
        </a>
      </p>
      <div className='my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]' />
    </div>
  );
}
