"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";

export function SignUpForm({
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.signUp");
  const router = useRouter();

  const handleProfessionalSignUp = () => {
    router.push("/auth/sign-up/professional");
  };

  const handleStructureSignUp = () => {
    router.push("/auth/sign-up/structure");
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6"
      {...props}
    >
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            {t("welcome")}{" "}
            <span className="text-blue-400">
              PRO
            </span>
            <span className="text-green-400">Kid</span> 👋
          </h1>
          <p className="text-lg text-gray-700">{t("question")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-700" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  👨‍🎓 {t("professional.title")}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("professional.roles")}
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  {t("professional.benefit")}
                </p>
              </div>
              <Button
                onClick={handleProfessionalSignUp}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {t("professional.button")}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-700" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  🏠 {t("structure.title")}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("structure.types")}
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  {t("structure.benefit")}
                </p>
              </div>
              <Button
                onClick={handleStructureSignUp}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {t("structure.button")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-gray-700">
          {t("hasAccount")}{" "}
          <Link
            href="/auth/login"
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            {t("loginLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
