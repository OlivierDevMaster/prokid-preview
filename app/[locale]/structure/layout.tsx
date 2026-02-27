'use client';

import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { StructureSidebar } from '@/features/structure/layout/StructureSidebar';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { usePathname } from '@/i18n/routing';

export default function StructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Disable body scroll on this route
  useBodyScrollLock();

  // Fetch structure data to get name
  const { data: structure } = useFindStructure(session?.user?.id);

  // Close sheet when pathname changes (navigation)
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  // Get structure name, fallback to 'Structure' if not available
  const structureName = structure?.name || 'Structure';

  return (
    <div className='flex h-screen overflow-hidden'>
      {/* Desktop Sidebar */}
      <div className='hidden h-full flex-shrink-0 lg:flex'>
        <StructureSidebar />
      </div>

      {/* Mobile/Tablet Sheet */}
      <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
        <SheetContent className='w-64 p-0' side='left'>
          <StructureSidebar />
        </SheetContent>
      </Sheet>

      <main className='flex-1 overflow-y-auto'>
        {/* Mobile menu button */}
        <div className='border-b bg-white px-4 py-2 shadow-sm lg:hidden'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-medium text-gray-900'>
              {structureName}
            </div>
            <Button
              className='h-9 w-9'
              onClick={() => setIsSheetOpen(true)}
              size='icon'
              variant='ghost'
            >
              <Menu className='h-5 w-5' />
            </Button>
          </div>
        </div>
        <div>{children}</div>
      </main>
    </div>
  );
}
