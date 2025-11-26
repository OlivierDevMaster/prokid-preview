"use client";

import { usePathname } from "@/i18n/routing";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";

export default function ConditionalWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes("/admin");
  const isAuthRoute = pathname?.includes("/auth");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminRoute && !isAuthRoute && <Navigation />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </div>
  );
}
