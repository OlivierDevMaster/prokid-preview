import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/admin/stat-card";
import { Building2, Users, MessageSquare } from "lucide-react";

export default async function DashboardPage() {
  const t = await getTranslations("admin.dashboard");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 mt-2">{t("subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t("totalAffaires")}
          value="3"
          icon={Building2}
        />
        <StatCard
          title={t("totalAcheteurs")}
          value="522"
          icon={Users}
        />
        <StatCard
          title={t("correspondancesPotentielles")}
          value="1566"
          icon={MessageSquare}
        />
      </div>
    </div>
  );
}
