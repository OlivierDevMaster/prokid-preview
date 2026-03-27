'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  ChevronLeft,
  LogOut,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/features/sign-up/professional/components/ProgressBar';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';

import {
  registerStructureProfile,
  type StructureSignUpFormData,
} from '../structureSignUp.service';

// --- Schema ---
const structureSignUpSchema = z.object({
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, 'La ville est requise'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  name: z.string().min(1, 'Le nom de la structure est requis'),
  phone: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  structureType: z.string().min(1, 'Le type de structure est requis'),
});

type FormData = z.infer<typeof structureSignUpSchema>;

// --- Constants ---
const TOTAL_STEPS = 3;

const STRUCTURE_TYPES = [
  { label: 'Crèche', value: 'crèche' },
  { label: 'Halte-garderie', value: 'halte-garderie' },
  { label: 'Multi-accueil', value: 'multi-accueil' },
  { label: 'MAM', value: 'mam' },
  { label: 'Micro-crèche', value: 'micro-crèche' },
  { label: "Jardin d'enfants", value: 'jardin-d-enfants' },
  { label: 'Autre', value: 'autre' },
];

const STEP_CONTENT: Record<number, { headline: string; subtitle: string }> = {
  1: {
    headline: 'Votre établissement',
    subtitle:
      'Commençons par les informations de base sur votre structure.',
  },
  2: {
    headline: 'Localisation',
    subtitle:
      'Indiquez où se trouve votre établissement pour être trouvé facilement.',
  },
  3: {
    headline: 'Responsable du compte',
    subtitle:
      'Dernière étape ! Renseignez vos informations personnelles.',
  },
};

const INPUT_CLASS =
  'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
const INPUT_WITH_ICON_CLASS =
  'flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
const ICON_CLASS =
  'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400';

// --- Component ---
export default function StructureOnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [userId, setUserId] = useState<null | string>(null);

  // City autocomplete state
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<
    Array<{
      centre: { coordinates: number[] };
      codesPostaux: string[];
      nom: string;
    }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      address: '',
      city: '',
      firstName: '',
      lastName: '',
      name: '',
      phone: '',
      postalCode: '',
      structureType: '',
    },
    mode: 'onChange',
    resolver: zodResolver(structureSignUpSchema) as unknown as Resolver<StructureSignUpFormData>,
  });

  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;

  // Load user ID and existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        const { data: user, error } = await supabase.auth.getUser();

        if (error || !user?.user) {
          throw new Error('Utilisateur non trouvé');
        }

        const currentUserId = user.user.id;
        setUserId(currentUserId);

        // Load existing structure data
        const { data: structure } = await supabase
          .from('structures')
          .select('name, structure_type, phone, address, city, postal_code')
          .eq('id', currentUserId)
          .single();

        if (structure) {
          if (structure.name) setValue('name', structure.name);
          if (structure.structure_type)
            setValue('structureType', structure.structure_type);
          if (structure.phone) setValue('phone', structure.phone);
          if (structure.address) setValue('address', structure.address);
          if (structure.city) {
            setValue('city', structure.city);
            setCityQuery(structure.city);
          }
          if (structure.postal_code)
            setValue('postalCode', structure.postal_code);
        }

        // Load existing profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', currentUserId)
          .single();

        if (profile) {
          if (profile.first_name) setValue('firstName', profile.first_name);
          if (profile.last_name) setValue('lastName', profile.last_name);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [setValue]);

  // City autocomplete
  const handleCitySearch = useCallback(
    (query: string) => {
      setCityQuery(query);
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
      if (query.length < 2) {
        setCitySuggestions([]);
        setShowSuggestions(false);
        return;
      }
      cityDebounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codesPostaux,centre&limit=5`
          );
          const data = await res.json();
          setCitySuggestions(data);
          setShowSuggestions(data.length > 0);
        } catch {
          setCitySuggestions([]);
        }
      }, 300);
    },
    []
  );

  const handleSelectCity = (city: {
    centre: { coordinates: number[] };
    codesPostaux: string[];
    nom: string;
  }) => {
    setValue('city', city.nom);
    setValue('postalCode', city.codesPostaux?.[0] ?? '');
    if (city.centre?.coordinates) {
      setValue('longitude', city.centre.coordinates[0], { shouldDirty: true });
      setValue('latitude', city.centre.coordinates[1], { shouldDirty: true });
    }
    setCityQuery(city.nom);
    setShowSuggestions(false);
  };

  // Step navigation
  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await form.trigger(['name', 'structureType']);
      if (!isValid) {
        setShowErrorSummary(true);
        return;
      }
    }
    if (currentStep === 2) {
      const isValid = await form.trigger(['address', 'city']);
      if (!isValid) {
        setShowErrorSummary(true);
        return;
      }
    }
    setShowErrorSummary(false);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit
  const handleSubmit = form.handleSubmit(
    async (data) => {
      if (!userId) {
        console.error('User ID is required');
        return;
      }
      setIsPending(true);
      try {
        await registerStructureProfile(userId, data as unknown as StructureSignUpFormData);
        toast.success('Votre établissement a été créé avec succès !');
        router.push('/structure/dashboard');
      } catch (error) {
        console.error('Error registering structure:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la création de l'établissement."
        );
      } finally {
        setIsPending(false);
      }
    },
    (validationErrors) => {
      console.error('Form validation errors:', validationErrors);
      setShowErrorSummary(true);
    }
  );

  // Loading / error states
  if (isLoadingData) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-slate-500'>Chargement...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-red-600'>Utilisateur non trouvé</p>
      </div>
    );
  }

  const formErrors = form.formState.errors;
  const hasErrors = showErrorSummary && Object.keys(formErrors).length > 0;

  const { headline, subtitle } = STEP_CONTENT[currentStep] ?? STEP_CONTENT[1];

  return (
    <div className='h-full min-h-0 w-full'>
      <div className='mx-auto grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(0,400px)_1fr] md:overflow-hidden'>
        {/* Left panel */}
        <div className='flex flex-col justify-between bg-[#2C3E50] p-6 text-white md:p-8 lg:p-10'>
          <div className='space-y-6'>
            <ProgressBar
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              variant='onDark'
            />
            <div className='space-y-3'>
              <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
                {headline}
              </h2>
              <p className='text-sm text-blue-100 md:text-base'>{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className='min-h-0 overflow-y-auto bg-white p-4 md:p-8 lg:p-12'>
          <div className='mx-auto max-w-xl'>
            {/* Logout button */}
            <div className='mb-6 flex justify-end'>
              <button
                className='flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700'
                onClick={() => signOut({ callbackUrl: '/fr/auth/login' })}
                type='button'
              >
                <LogOut className='h-4 w-4' />
                Déconnexion
              </button>
            </div>

            {/* Error summary */}
            {hasErrors && (
              <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                <p className='font-semibold'>
                  Veuillez corriger les erreurs suivantes :
                </p>
                <ul className='mt-1 list-inside list-disc'>
                  {Object.entries(formErrors).map(([key, err]) => (
                    <li key={key}>{err?.message && String(err.message)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step 1: Structure info */}
            {currentStep === 1 && (
              <div className='space-y-5'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
                    Votre établissement
                  </h1>
                  <p className='mt-1 text-sm text-slate-500'>
                    Renseignez les informations de base sur votre structure.
                  </p>
                </div>

                {/* Structure name */}
                <div className='space-y-1'>
                  <Label
                    className='text-xs font-medium text-slate-600'
                    htmlFor='name'
                  >
                    Nom de la structure *
                  </Label>
                  <Controller
                    control={control}
                    name='name'
                    render={({ field }) => (
                      <div className='relative'>
                        <Building2 className={ICON_CLASS} />
                        <input
                          className={INPUT_WITH_ICON_CLASS}
                          id='name'
                          onChange={field.onChange}
                          placeholder='Ex: Crèche Les Petits Pas'
                          type='text'
                          value={field.value}
                        />
                      </div>
                    )}
                  />
                  {errors.name && (
                    <p className='text-xs text-red-500'>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Structure type */}
                <div className='space-y-1'>
                  <Label
                    className='text-xs font-medium text-slate-600'
                    htmlFor='structureType'
                  >
                    Type *
                  </Label>
                  <Controller
                    control={control}
                    name='structureType'
                    render={({ field }) => (
                      <select
                        className={INPUT_CLASS}
                        id='structureType'
                        onChange={field.onChange}
                        value={field.value}
                      >
                        <option value=''>Sélectionnez un type</option>
                        {STRUCTURE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.structureType && (
                    <p className='text-xs text-red-500'>
                      {errors.structureType.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className='space-y-1'>
                  <Label
                    className='text-xs font-medium text-slate-600'
                    htmlFor='phone'
                  >
                    Téléphone
                  </Label>
                  <Controller
                    control={control}
                    name='phone'
                    render={({ field }) => (
                      <div className='relative'>
                        <Phone className={ICON_CLASS} />
                        <input
                          className={INPUT_WITH_ICON_CLASS}
                          id='phone'
                          onChange={field.onChange}
                          placeholder='Ex: 01 23 45 67 89'
                          type='tel'
                          value={field.value}
                        />
                      </div>
                    )}
                  />
                  {errors.phone && (
                    <p className='text-xs text-red-500'>
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Navigation */}
                <div className='flex justify-end pt-2'>
                  <Button
                    className='h-10 rounded-xl bg-blue-600 px-8 text-sm text-white hover:bg-blue-700'
                    onClick={handleNext}
                    type='button'
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className='space-y-5'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
                    Localisation
                  </h1>
                  <p className='mt-1 text-sm text-slate-500'>
                    Indiquez l'adresse de votre établissement.
                  </p>
                </div>

                {/* Address */}
                <div className='space-y-1'>
                  <Label
                    className='text-xs font-medium text-slate-600'
                    htmlFor='address'
                  >
                    Adresse *
                  </Label>
                  <Controller
                    control={control}
                    name='address'
                    render={({ field }) => (
                      <div className='relative'>
                        <MapPin className={ICON_CLASS} />
                        <input
                          className={INPUT_WITH_ICON_CLASS}
                          id='address'
                          onChange={field.onChange}
                          placeholder='Ex: 12 rue des Lilas'
                          type='text'
                          value={field.value}
                        />
                      </div>
                    )}
                  />
                  {errors.address && (
                    <p className='text-xs text-red-500'>
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* City + Postal code */}
                <div className='grid grid-cols-3 gap-3'>
                  <div className='col-span-2 space-y-1'>
                    <Label
                      className='text-xs font-medium text-slate-600'
                      htmlFor='city'
                    >
                      Ville *
                    </Label>
                    <div className='relative'>
                      <MapPin className={ICON_CLASS} />
                      <input
                        className={INPUT_WITH_ICON_CLASS}
                        id='city'
                        onChange={(e) => {
                          handleCitySearch(e.target.value);
                          setValue('city', e.target.value);
                        }}
                        onFocus={() =>
                          citySuggestions.length > 0 &&
                          setShowSuggestions(true)
                        }
                        placeholder='Ex: Paris'
                        type='text'
                        value={cityQuery || watch('city')}
                      />
                      {watch('city') && (
                        <button
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                          onClick={() => {
                            setValue('city', '');
                            setValue('postalCode', '');
                            setCityQuery('');
                            setCitySuggestions([]);
                          }}
                          type='button'
                        >
                          <X className='h-3.5 w-3.5' />
                        </button>
                      )}
                      {showSuggestions && citySuggestions.length > 0 && (
                        <div className='absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white py-1 shadow-lg'>
                          {citySuggestions.map((city) => (
                            <button
                              className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50'
                              key={city.nom + city.codesPostaux?.[0]}
                              onClick={() => handleSelectCity(city)}
                              type='button'
                            >
                              <MapPin className='h-3.5 w-3.5 shrink-0 text-slate-400' />
                              {city.nom}
                              {city.codesPostaux?.[0] && (
                                <span className='text-xs text-slate-400'>
                                  ({city.codesPostaux[0]})
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.city && (
                      <p className='text-xs text-red-500'>
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <Label
                      className='text-xs font-medium text-slate-600'
                      htmlFor='postalCode'
                    >
                      Code postal
                    </Label>
                    <Controller
                      control={control}
                      name='postalCode'
                      render={({ field }) => (
                        <input
                          className={INPUT_CLASS}
                          id='postalCode'
                          onChange={field.onChange}
                          placeholder='Ex: 75001'
                          type='text'
                          value={field.value}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className='flex justify-between pt-2'>
                  <Button
                    className='h-10 rounded-xl border border-slate-200 bg-white px-6 text-sm text-slate-700 hover:bg-slate-50'
                    onClick={handlePrevious}
                    type='button'
                    variant='outline'
                  >
                    <ChevronLeft className='mr-1 h-4 w-4' />
                    Précédent
                  </Button>
                  <Button
                    className='h-10 rounded-xl bg-blue-600 px-8 text-sm text-white hover:bg-blue-700'
                    onClick={handleNext}
                    type='button'
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Account owner */}
            {currentStep === 3 && (
              <div className='space-y-5'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
                    Le responsable du compte
                  </h1>
                  <p className='mt-1 text-sm text-slate-500'>
                    Renseignez vos informations personnelles pour finaliser
                    l'inscription.
                  </p>
                </div>

                {/* First name */}
                <div className='space-y-1'>
                  <Label
                    className='text-xs font-medium text-slate-600'
                    htmlFor='firstName'
                  >
                    Prénom *
                  </Label>
                  <Controller
                    control={control}
                    name='firstName'
                    render={({ field }) => (
                      <div className='relative'>
                        <User className={ICON_CLASS} />
                        <input
                          className={INPUT_WITH_ICON_CLASS}
                          id='firstName'
                          onChange={field.onChange}
                          placeholder='Votre prénom'
                          type='text'
                          value={field.value}
                        />
                      </div>
                    )}
                  />
                  {errors.firstName && (
                    <p className='text-xs text-red-500'>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last name */}
                <div className='space-y-1'>
                  <Label
                    className='text-xs font-medium text-slate-600'
                    htmlFor='lastName'
                  >
                    Nom *
                  </Label>
                  <Controller
                    control={control}
                    name='lastName'
                    render={({ field }) => (
                      <div className='relative'>
                        <User className={ICON_CLASS} />
                        <input
                          className={INPUT_WITH_ICON_CLASS}
                          id='lastName'
                          onChange={field.onChange}
                          placeholder='Votre nom'
                          type='text'
                          value={field.value}
                        />
                      </div>
                    )}
                  />
                  {errors.lastName && (
                    <p className='text-xs text-red-500'>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                {/* Navigation */}
                <div className='flex justify-between pt-2'>
                  <Button
                    className='h-10 rounded-xl border border-slate-200 bg-white px-6 text-sm text-slate-700 hover:bg-slate-50'
                    onClick={handlePrevious}
                    type='button'
                    variant='outline'
                  >
                    <ChevronLeft className='mr-1 h-4 w-4' />
                    Précédent
                  </Button>
                  <Button
                    className='h-10 rounded-xl bg-blue-600 px-8 text-sm text-white hover:bg-blue-700'
                    disabled={isPending}
                    onClick={handleSubmit}
                    type='button'
                  >
                    {isPending
                      ? 'Création en cours...'
                      : 'Créer mon établissement'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
