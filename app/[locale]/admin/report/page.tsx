import { ReportsList } from '@/features/admin/report/components/ReportsList';

export default async function ReportsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ReportsList locale={locale} />;
}
