'use client';

import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BoNavbar } from '@/features/layout/BoNavbar';
import { StructureSidebar } from '@/features/structure/layout/StructureSidebar';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';
import { usePathname } from '@/i18n/routing';

export default function StructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch structure data to get name
  const { data: structure } = useFindStructure(session?.user?.id);

  // Close sheet when pathname changes (navigation)
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  // Get structure name, fallback to 'Structure' if not available
  const structureName = structure?.name || 'Structure';

  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <div className='relative flex flex-col items-start border-b shadow-sm lg:flex-row lg:border-b-0 lg:shadow-none'>
        <BoNavbar name={structureName} userRole='Structure' />
        {/* Mobile Menu Button */}
        <div className='lg:hidden'>
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
      <div className='flex flex-1 overflow-hidden'>
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
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
