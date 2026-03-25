'use client';

import { MapPin, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

export type CityResult = {
  code: string;
  latitude: number;
  longitude: number;
  name: string;
};

interface ProfessionalLocationInputProps {
  onChange: (value: string, coords?: { latitude: number; longitude: number }) => void;
  value: string;
}

export function ProfessionalLocationInput({
  onChange,
  value,
}: ProfessionalLocationInputProps) {
  const t = useTranslations('professional');
  const [inputValue, setInputValue] = useState(value);
  const [cities, setCities] = useState<CityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skipFetchRef = useRef(false);

  useEffect(() => {
    if (value !== inputValue) {
      skipFetchRef.current = true;
      setInputValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    if (!inputValue || inputValue.length < 2) {
      setCities([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(
          inputValue
        )}&fields=nom,code,centre&boost=population&limit=8`
      )
        .then(res => res.json())
        .then((data: { centre?: { coordinates: number[] }; code: string; nom: string }[]) => {
          setCities(
            data
              .filter(city => city.centre?.coordinates)
              .map(city => ({
                code: city.code,
                latitude: city.centre!.coordinates[1],
                longitude: city.centre!.coordinates[0],
                name: city.nom,
              }))
          );
          setIsOpen(true);
        })
        .catch(() => setCities([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (city: CityResult) => {
      skipFetchRef.current = true;
      setInputValue(city.name);
      setIsOpen(false);
      setCities([]);
      onChange(city.name, { latitude: city.latitude, longitude: city.longitude });
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    skipFetchRef.current = true;
    setInputValue('');
    setCities([]);
    setIsOpen(false);
    onChange('');
  }, [onChange]);

  return (
    <div className='relative' ref={wrapperRef}>
      <div className='relative'>
        <MapPin className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <input
          className='h-11 w-full border-none bg-transparent pl-9 pr-9 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400'
          onChange={e => setInputValue(e.target.value)}
          onFocus={() => {
            if (cities.length > 0) setIsOpen(true);
          }}
          placeholder={t('search.locationPlaceholder')}
          type='text'
          value={inputValue}
        />
        {inputValue && (
          <button
            className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600'
            onClick={handleClear}
            type='button'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        )}
      </div>
      {isOpen && cities.length > 0 && (
        <ul className='absolute left-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg'>
          {cities.map(city => (
            <li key={city.code}>
              <button
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50'
                onClick={() => handleSelect(city)}
                type='button'
              >
                <MapPin className='h-3.5 w-3.5 flex-shrink-0 text-slate-400' />
                {city.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
