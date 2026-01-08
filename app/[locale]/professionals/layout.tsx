export default async function ProfessionalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Pagination meta tags removed - they were causing React DOM errors during route transitions */}
      {/* The PaginationLinks component handles this functionality instead */}
      {children}
    </>
  );
}
