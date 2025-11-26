import { getTranslations } from "next-intl/server";
import { UserService } from "@/services/admin/users/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/admin/users-table";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin.users");
  const users = await UserService.getAllUsers();

  const translations = {
    name: t("name"),
    email: t("email"),
    emailVerified: t("emailVerified"),
    lastSignIn: t("lastSignIn"),
    createdAt: t("createdAt"),
    noName: t("noName"),
    verified: t("verified"),
    notVerified: t("notVerified"),
    never: t("never"),
    previous: t("previous"),
    next: t("next"),
    page: t("page"),
    of: t("of"),
    noResults: t("noResults"),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 mt-2">{t("subtitle")}</p>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("tableTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t("noUsers")}</p>
          ) : (
            <UsersTable data={users} locale={locale} translations={translations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
