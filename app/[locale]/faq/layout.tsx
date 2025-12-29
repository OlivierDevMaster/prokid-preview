import { FAQSchema } from './FAQSchema';

export default async function FAQLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <FAQSchema locale={locale} />
      {children}
    </>
  );
}
