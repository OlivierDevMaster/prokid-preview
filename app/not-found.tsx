import type { Metadata } from 'next';

import { ArrowLeft, HelpCircle, Home, Search } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  description: 'Page not found',
  robots: {
    follow: true,
    index: false,
  },
  title: '404 - Page Not Found',
};

export default function GlobalNotFound() {
  const navigationLinks = [
    {
      href: '/fr/',
      icon: Home,
      label: 'Accueil',
    },
    {
      href: '/fr/professionals',
      icon: Search,
      label: 'Professionnels',
    },
    {
      href: '/fr/faq',
      icon: HelpCircle,
      label: 'FAQ',
    },
  ];

  return (
    <html lang='fr'>
      <body>
        <main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <div className='mb-8'>
              <h1 className='mb-4 text-6xl font-bold text-gray-900 sm:text-8xl'>
                404
              </h1>
              <h2 className='mb-4 text-3xl font-bold text-gray-800 sm:text-4xl'>
                Page non trouvée
              </h2>
              <p className='mx-auto max-w-md text-lg text-gray-600'>
                Désolé, la page que vous recherchez n&apos;existe pas ou a été
                déplacée.
              </p>
            </div>

            <Card className='mb-8'>
              <CardHeader>
                <CardTitle>Liens utiles</CardTitle>
                <CardDescription>
                  Voici quelques pages qui pourraient vous intéresser :
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  {navigationLinks.map(link => {
                    const Icon = link.icon;
                    return (
                      <Link href={link.href} key={link.href}>
                        <Button
                          className='w-full justify-start gap-2'
                          variant='outline'
                        >
                          <Icon className='h-4 w-4' />
                          {link.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
              <Link href='/fr/'>
                <Button className='gap-2' size='lg'>
                  <ArrowLeft className='h-4 w-4' />
                  Retour à l&apos;accueil
                </Button>
              </Link>
              <Link href='/fr/professionals'>
                <Button className='gap-2' size='lg' variant='outline'>
                  <Search className='h-4 w-4' />
                  Parcourir les professionnels
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
