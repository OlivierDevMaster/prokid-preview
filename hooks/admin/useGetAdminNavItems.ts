"use client";

import { getUser } from "@/services/auth/auth.service";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export default function useGetAdminNavItems(): NavItem[] {
  const { data: session } = useSession();
  const user = session?.user;
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  
  const { data } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUser(user?.id as string),
    enabled: !!user?.id, // Ne faire la requête que si l'ID existe
  });

  // Mettre à jour les items de navigation uniquement côté client après l'hydratation
  useEffect(() => {
    if (!user || !data?.profile) {
      setNavItems([]);
      return;
    }

    const profile = data.profile;
    const items: NavItem[] = [];

    if (profile?.userType === "professional") {
      items.push({
        href: "/admin/planning",
        label: "planning",
        icon: "planning",
      });
      items.push({
        href: "/admin/report",
        label: "report",
        icon: "report",
      });
    }

    setNavItems(items);
  }, [user, data?.profile]);

  // Toujours retourner un tableau vide au premier render pour éviter les problèmes d'hydratation
  // Les items seront mis à jour dans useEffect après l'hydratation
  return navItems;
}
