'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useAdminUser } from '../hooks/useAdminUsers';

function getRoleBadge(role: string) {
  switch (role) {
    case 'professional':
      return (
        <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
          Professionnel
        </Badge>
      );
    case 'structure':
      return (
        <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
          Structure
        </Badge>
      );
    case 'admin':
      return (
        <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
          Admin
        </Badge>
      );
    default:
      return <Badge variant='secondary'>{role}</Badge>;
  }
}

export function UserDetailPage() {
  const { id } = useParams();

  const { data: user, isLoading } = useAdminUser(id as string);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500'>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            Utilisateur non trouve
          </h1>
          <Link href='/admin/users'>
            <Button>Retour a la liste</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sans nom';

  return (
    <div className='space-y-6 bg-blue-50/30 p-4 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/users'>
            <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
          </Link>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Details de l&apos;utilisateur
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button disabled variant='destructive'>
                    Supprimer
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contactez le support pour supprimer un utilisateur</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-semibold text-gray-700'>Nom</label>
              <p className='text-gray-900'>{fullName}</p>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                Email
              </label>
              <p className='text-gray-900'>{user.email}</p>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                Role
              </label>
              <div className='mt-1'>{getRoleBadge(user.role)}</div>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                Statut d&apos;inscription
              </label>
              <div className='mt-1'>
                {user.is_onboarded ? (
                  <Badge className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
                    Inscrit
                  </Badge>
                ) : (
                  <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
                    En attente
                  </Badge>
                )}
              </div>
            </div>
            {user.preferred_language && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  Langue preferee
                </label>
                <p className='text-gray-900'>
                  {user.preferred_language === 'fr' ? 'Francais' : 'Anglais'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations supplementaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations supplementaires</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                Date de creation
              </label>
              <p className='text-gray-900'>
                {format(new Date(user.created_at), 'dd MMMM yyyy, HH:mm', {
                  locale: fr,
                })}
              </p>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                Identifiant
              </label>
              <p className='font-mono text-sm text-gray-600'>{user.user_id}</p>
            </div>
            {user.invitation_status && user.invitation_status !== 'none' && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  Statut d&apos;invitation
                </label>
                <div className='mt-1'>
                  {user.invitation_status === 'pending' && (
                    <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
                      En attente
                    </Badge>
                  )}
                  {user.invitation_status === 'accepted' && (
                    <Badge className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
                      Acceptee
                    </Badge>
                  )}
                  {user.invitation_status === 'declined' && (
                    <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
                      Refusee
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {user.invited_by && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  Invite par
                </label>
                <p className='font-mono text-sm text-gray-600'>
                  {user.invited_by}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Info */}
        {user.role === 'professional' && user.professional && (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Informations professionnelles</CardTitle>
                <Link href={`/admin/professionals/${user.user_id}`}>
                  <Button size='sm' variant='outline'>
                    Voir la fiche pro
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {user.professional.city && (
                <div>
                  <label className='text-sm font-semibold text-gray-700'>
                    Ville
                  </label>
                  <p className='text-gray-900'>{user.professional.city}</p>
                </div>
              )}
              {user.professional.skills &&
                user.professional.skills.length > 0 && (
                  <div>
                    <label className='text-sm font-semibold text-gray-700'>
                      Competences
                    </label>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {user.professional.skills.map((skill, index) => (
                        <Badge key={index} variant='secondary'>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {user.professional.description && (
                <div>
                  <label className='text-sm font-semibold text-gray-700'>
                    Description
                  </label>
                  <p className='mt-1 whitespace-pre-wrap text-gray-700'>
                    {user.professional.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Structure Info */}
        {user.role === 'structure' && user.structure && (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Informations de la structure</CardTitle>
                <Link href={`/admin/structures/${user.user_id}`}>
                  <Button size='sm' variant='outline'>
                    Voir la structure
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  Nom de la structure
                </label>
                <p className='text-gray-900'>{user.structure.name}</p>
              </div>
              {user.structure.structure_type && (
                <div>
                  <label className='text-sm font-semibold text-gray-700'>
                    Type de structure
                  </label>
                  <p className='text-gray-900'>
                    {user.structure.structure_type}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
