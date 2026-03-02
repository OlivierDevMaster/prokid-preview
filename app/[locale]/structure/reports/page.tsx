import { useEffect } from 'react';
import { ReportsList } from '@/features/structure/reports/components/ReportsList';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

export default function StructureReportsPage() {
  const { handleClearSelection } = useSelectedProfessional();
  useEffect(() => {
    handleClearSelection();
  }, [handleClearSelection]);
  return <ReportsList />;
}
