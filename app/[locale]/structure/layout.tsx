import { ProfessionalNavbar } from '@/features/professional/layout/ProfessionalNavbar';
import { ProfessionalSidebar } from '@/features/professional/layout/ProfessionalSidebar';

export default function StructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      <ProfessionalNavbar />
      <div className='bg-green flex flex-1 overflow-hidden'>
        <ProfessionalSidebar />
        <main className='flex-1 overflow-auto'>
          <div className='p-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
