"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/professional");
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="text-2xl font-bold mt-4">loading....</div>
    </main>
  );
}
