'use client';

import { Building2, MapPin, Phone, Save, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';
import { useUpdateStructure } from '@/features/structures/hooks/useUpdateStructure';
import { updateStructureLocation } from '@/features/structures/structure.service';

import { IdentifiersForm } from './IdentifiersForm';
import { PasswordChangeForm } from './PasswordChangeForm';

const STRUCTURE_TYPES = [
  { label: 'Crèche collective', value: 'creche_collective' },
  { label: 'Micro-crèche', value: 'micro_creche' },
  { label: 'Crèche familiale', value: 'creche_familiale' },
  { label: 'Crèche parentale', value: 'creche_parentale' },
  { label: 'Multi-accueil', value: 'multi_accueil' },
  { label: 'Halte-garderie', value: 'halte_garderie' },
  { label: 'Maison d\'Assistantes Maternelles (MAM)', value: 'mam' },
  { label: 'Jardin d\'enfants', value: 'jardin_enfants' },
  { label: 'Autre', value: 'autre' },
];

export function ProfileTabContent() {
  const t = useTranslations('common');
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data: structure } = useFindStructure(userId);
  const updateMutation = useUpdateStructure();

  // Structure fields
  const [name, setName] = useState('');
  const [structureType, setStructureType] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  // Responsable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Sync from DB
  useEffect(() => {
    if (!structure) return;
    const s = structure as unknown as {
      address?: string;
      city?: string;
      name?: string;
      phone?: string;
      postal_code?: string;
      profile?: { first_name?: string; last_name?: string };
      structure_type?: string;
    };
    setName(s.name || '');
    setStructureType(s.structure_type || '');
    setAddress(s.address || '');
    setCity(s.city || '');
    setPostalCode(s.postal_code || '');
    setPhone(s.phone || '');
    setFirstName(s.profile?.first_name || '');
    setLastName(s.profile?.last_name || '');
  }, [structure]);

  const handleSaveStructure = async () => {
    if (!userId || !name.trim()) return;

    try {
      // Geocode the city to get coordinates
      let latitude: null | number = null;
      let longitude: null | number = null;

      if (city.trim()) {
        try {
          const res = await fetch(
            `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(city.trim())}&fields=nom,code,centre&boost=population&limit=1`
          );
          const data = await res.json();
          if (data?.[0]?.centre?.coordinates) {
            longitude = data[0].centre.coordinates[0];
            latitude = data[0].centre.coordinates[1];
          }
        } catch {
          // Geocoding failed silently — save without coords
        }
      }

      await updateMutation.mutateAsync({
        updateData: {
          address: address.trim() || null,
          city: city.trim() || null,
          name: name.trim(),
          phone: phone.trim() || null,
          postal_code: postalCode.trim() || null,
          structure_type: structureType || null,
        },
        userId,
      });

      // Update PostGIS location if we got coordinates
      if (latitude !== null && longitude !== null) {
        await updateStructureLocation(userId, latitude, longitude);
      }

      toast.success('Informations mises à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className='space-y-8'>
      {/* ─── Section 1: Établissement ─── */}
      <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-center gap-3 border-b border-slate-100 px-6 py-4'>
          <Building2 className='h-5 w-5 text-[#4A90E2]' />
          <h2 className='text-lg font-bold text-slate-900'>Établissement</h2>
        </div>
        <div className='space-y-5 p-6'>
          {/* Name */}
          <div>
            <Label className='text-sm font-medium text-slate-700'>
              Nom de la structure *
            </Label>
            <Input
              className='mt-1.5 h-11 rounded-xl border-slate-200'
              onChange={e => setName(e.target.value)}
              placeholder='Crèche Les Petits Loups'
              value={name}
            />
          </div>

          {/* Type */}
          <div>
            <Label className='text-sm font-medium text-slate-700'>
              Type d&apos;établissement
            </Label>
            <Select onValueChange={setStructureType} value={structureType}>
              <SelectTrigger className='mt-1.5 h-11 rounded-xl border-slate-200'>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent className='rounded-xl'>
                {STRUCTURE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address row */}
          <div>
            <Label className='text-sm font-medium text-slate-700'>
              <MapPin className='mr-1 inline h-3.5 w-3.5' />
              Adresse
            </Label>
            <Input
              className='mt-1.5 h-11 rounded-xl border-slate-200'
              onChange={e => setAddress(e.target.value)}
              placeholder='12 Rue de la Paix'
              value={address}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm font-medium text-slate-700'>
                Ville
              </Label>
              <Input
                className='mt-1.5 h-11 rounded-xl border-slate-200'
                onChange={e => setCity(e.target.value)}
                placeholder='Paris'
                value={city}
              />
            </div>
            <div>
              <Label className='text-sm font-medium text-slate-700'>
                Code postal
              </Label>
              <Input
                className='mt-1.5 h-11 rounded-xl border-slate-200'
                onChange={e => setPostalCode(e.target.value)}
                placeholder='75001'
                value={postalCode}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label className='text-sm font-medium text-slate-700'>
              <Phone className='mr-1 inline h-3.5 w-3.5' />
              Téléphone de la structure
            </Label>
            <Input
              className='mt-1.5 h-11 rounded-xl border-slate-200'
              onChange={e => setPhone(e.target.value)}
              placeholder='01 42 00 00 00'
              value={phone}
            />
          </div>

          {/* Save button */}
          <div className='flex justify-end pt-2'>
            <Button
              className='flex h-11 items-center gap-2 rounded-xl bg-[#4A90E2] px-6 text-sm font-semibold text-white shadow-sm hover:opacity-90'
              disabled={updateMutation.isPending || !name.trim()}
              onClick={handleSaveStructure}
            >
              <Save className='h-4 w-4' />
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Responsable du compte ─── */}
      <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-center gap-3 border-b border-slate-100 px-6 py-4'>
          <Users className='h-5 w-5 text-[#4A90E2]' />
          <h2 className='text-lg font-bold text-slate-900'>Responsable du compte</h2>
        </div>
        <div className='space-y-5 p-6'>
          {/* Name fields */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm font-medium text-slate-700'>
                Prénom
              </Label>
              <Input
                className='mt-1.5 h-11 rounded-xl border-slate-200'
                disabled
                value={firstName}
              />
            </div>
            <div>
              <Label className='text-sm font-medium text-slate-700'>
                Nom
              </Label>
              <Input
                className='mt-1.5 h-11 rounded-xl border-slate-200'
                disabled
                value={lastName}
              />
            </div>
          </div>

          {/* Email */}
          <IdentifiersForm />

          {/* Password */}
          <PasswordChangeForm />
        </div>
      </section>

      {/* ─── Section 3: Équipe (coming soon) ─── */}
      <section className='overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white/60'>
        <div className='flex flex-col items-center justify-center px-6 py-12 text-center'>
          <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100'>
            <Users className='h-7 w-7 text-slate-400' />
          </div>
          <h2 className='text-lg font-bold text-slate-900'>Équipe</h2>
          <p className='mt-1 max-w-sm text-sm text-slate-500'>
            Bientôt, invitez des membres de votre équipe pour co-gérer votre structure, suivre les missions et communiquer avec les professionnels.
          </p>
          <span className='mt-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#4A90E2]'>
            Prochainement
          </span>
        </div>
      </section>
    </div>
  );
}
