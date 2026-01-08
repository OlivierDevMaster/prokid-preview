import { EditMissionPage } from '@/features/structure/missions/components/EditMissionPage';

interface EditMissionPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EditMissionPageRoute({
  params,
}: EditMissionPageProps) {
  const { id } = await params;

  return <EditMissionPage missionId={id} />;
}
