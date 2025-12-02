'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={'sm'} variant='ghost'>
          {theme === 'light' ? (
            <Sun
              className={'text-muted-foreground'}
              key='light'
              size={ICON_SIZE}
            />
          ) : theme === 'dark' ? (
            <Moon
              className={'text-muted-foreground'}
              key='dark'
              size={ICON_SIZE}
            />
          ) : (
            <Laptop
              className={'text-muted-foreground'}
              key='system'
              size={ICON_SIZE}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-content'>
        <DropdownMenuRadioGroup onValueChange={e => setTheme(e)} value={theme}>
          <DropdownMenuRadioItem className='flex gap-2' value='light'>
            <Sun className='text-muted-foreground' size={ICON_SIZE} />{' '}
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className='flex gap-2' value='dark'>
            <Moon className='text-muted-foreground' size={ICON_SIZE} />{' '}
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className='flex gap-2' value='system'>
            <Laptop className='text-muted-foreground' size={ICON_SIZE} />{' '}
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
