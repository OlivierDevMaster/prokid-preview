import { headers } from 'next/headers';

import { getAppUrl } from '@/lib/utils';

export default async function ProfessionalsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const appUrl = getAppUrl();
  const baseUrl = `${appUrl}/${locale}/professionals`;

  // Extract page number from URL
  const url = new URL(pathname || `${baseUrl}`, appUrl);
  const currentPage = parseInt(url.searchParams.get('page') || '1', 10);

  // Calculate pagination URLs
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const prevUrl = prevPage
    ? prevPage === 1
      ? baseUrl
      : `${baseUrl}?page=${prevPage}`
    : null;
  const nextUrl = `${baseUrl}?page=${currentPage + 1}`;

  return (
    <>
      {/* Add pagination meta tags */}
      {prevUrl && <link href={prevUrl} rel='prev' />}
      <link href={nextUrl} rel='next' />
      {children}
    </>
  );
}
