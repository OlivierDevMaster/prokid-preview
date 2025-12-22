'use client';

import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { routing } from '@/i18n/routing';
import { usePathname } from '@/i18n/routing';

const LanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale !== locale) {
      // Construct the new path with the locale
      const newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`;
      window.location.href = newPath;
    }
  };

  const ICON_SIZE = 16;

  const localeLabels: Record<string, string> = {
    en: 'English',
    fr: 'Français',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={'sm'} variant='ghost'>
          <Globe className={'text-muted-foreground'} size={ICON_SIZE} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-content'>
        <DropdownMenuRadioGroup
          onValueChange={handleLocaleChange}
          value={locale}
        >
          {routing.locales.map(loc => (
            <DropdownMenuRadioItem className='flex gap-2' key={loc} value={loc}>
              <Globe className='text-muted-foreground' size={ICON_SIZE} />{' '}
              <span>{localeLabels[loc] || loc}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { LanguageSwitcher };
