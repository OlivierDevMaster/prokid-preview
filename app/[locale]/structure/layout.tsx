import { BoNavbar } from '@/features/layout/BoNavbar';
import { StructureSidebar } from '@/features/structure/layout/StructureSidebar';

export default function StructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <BoNavbar userRole='Structure' />
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex h-full flex-shrink-0'>
          <StructureSidebar />
        </div>
        <main className='flex-1 overflow-y-auto'>
          <div className='p-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
