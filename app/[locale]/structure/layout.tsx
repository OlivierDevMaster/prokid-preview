import { BoNavbar } from '@/features/layout/BoNavbar';
import { StructureSidebar } from '@/features/structure/layout/StructureSidebar';

export default function StructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      <BoNavbar userRole='Structure' />
      <div className='bg-green flex flex-1 overflow-hidden'>
        <StructureSidebar />
        <main className='flex-1 overflow-auto'>
          <div className='p-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
