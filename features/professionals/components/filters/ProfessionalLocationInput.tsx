'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
} from '@/components/ui/combobox';

interface ProfessionalLocationInputProps {
  onChange: (value: string) => void;
  value: string;
}

export function ProfessionalLocationInput({
  onChange,
  value,
}: ProfessionalLocationInputProps) {
  const t = useTranslations('professional');
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!query) {
      setCities([]);
      return;
    }
    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(
          query
        )}&fields=nom,code&boost=population&limit=10`
      )
        .then(res => res.json())
        .then((data: { code: string; nom: string }[]) => {
          const formatted = data.map(city => ({
            code: city.code,
            name: city.nom,
          }));
          setCities(formatted);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <Combobox
      onValueChange={newValue => {
        const valueString = typeof newValue === 'string' ? newValue : '';
        onChange(valueString);
        if (valueString) {
          setQuery(valueString);
        }
      }}
    >
      <ComboboxInput
        className='rounded-xl bg-slate-100 font-medium has-[[data-slot=input-group-control]:focus-visible]:!border-blue-500 has-[[data-slot=input-group-control]:focus-visible]:!ring-0 [&_[data-slot=input-group-control]]:placeholder:text-xs [&_[data-slot=input-group-control]]:placeholder:text-slate-800'
        inputClassName='group-focus-within/input-group:placeholder:!text-blue-500'
        onChange={e => setQuery(e.target.value)}
        placeholder={t('search.locationPlaceholder')}
        triggerIconClassName='group-focus-within/input-group:text-blue-500'
        value={query || value}
      />
      <ComboboxContent>
        {cities.map(city => (
          <ComboboxItem key={city.code} value={city.name}>
            {city.name}
          </ComboboxItem>
        ))}
      </ComboboxContent>
    </Combobox>
  );
}
