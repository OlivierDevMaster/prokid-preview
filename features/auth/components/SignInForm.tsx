'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        window.location.href = '/';
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold'>Sign In</h1>
        <p className='text-sm text-muted-foreground'>
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
          {error}
        </div>
      )}

      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          disabled={isLoading}
          id='email'
          onChange={e => setEmail(e.target.value)}
          placeholder='you@example.com'
          required
          type='email'
          value={email}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          disabled={isLoading}
          id='password'
          onChange={e => setPassword(e.target.value)}
          required
          type='password'
          value={password}
        />
      </div>

      <Button className='w-full' disabled={isLoading} type='submit'>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
