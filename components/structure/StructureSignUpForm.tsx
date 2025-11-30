"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/routing";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "@/services/auth/auth.service";
import { toast } from "sonner";

export function StructureSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.signUp.structureForm");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: ({ body }: { body: { firstName: string; lastName: string; email: string; password: string } }) =>
      signUp({ userType: "structure", body }),
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      setIsLoading(false);
      return;
    }

    try {
      mutation.mutate(
        { body: { firstName, lastName, email, password } },
        {
          onSuccess: () => {
            toast.success(t("success"));
          },
        }
      );

      router.push("/auth/login?registered=true");
    } catch (err) {
      console.error("Sign up error:", err);
      setError(t("error"));
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full">
        <CardContent className="p-6">
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-gray-800">{t("title")}</h1>
              <p className="text-sm text-gray-600">{t("subtitle")}</p>
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700">
                  {t("firstNameLabel")}
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t("firstNamePlaceholder")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">
                  {t("lastNameLabel")}
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t("lastNamePlaceholder")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                {t("emailLabel")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                {t("passwordLabel")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                {t("confirmPasswordLabel")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? t("submitButton") + "..." : t("submitButton")}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <Link
                href="/auth/login"
                className="text-blue-500 hover:text-blue-600 transition-colors font-medium"
              >
                {t("hasAccount")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

