"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const title = useTranslations("title");

  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">{title("project")}</h3>
            <p className="text-sm text-slate-300 mb-4">{t("tagline")}</p>
            <p className="text-sm text-slate-200 max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-5 mt-12">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("forStructures")}</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link
                    href="/find-professional"
                    className="transition-colors hover:text-white"
                  >
                    {t("findProfessional")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="transition-colors hover:text-white"
                  >
                    {t("howItWorks")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="transition-colors hover:text-white"
                  >
                    {t("pricing")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("forProfessionals")}</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link
                    href="/become-visible"
                    className="transition-colors hover:text-white"
                  >
                    {t("becomeVisible")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/referencing"
                    className="transition-colors hover:text-white"
                  >
                    {t("referencing")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/free-trial"
                    className="transition-colors hover:text-white"
                  >
                    {t("freeTrial")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("resources")}</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link
                    href="/blog"
                    className="transition-colors hover:text-white"
                  >
                    {t("blog")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/job-guides"
                    className="transition-colors hover:text-white"
                  >
                    {t("jobGuides")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help-center"
                    className="transition-colors hover:text-white"
                  >
                    {t("helpCenter")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("legal")}</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-white"
                  >
                    {t("terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-white"
                  >
                    {t("privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal-notices"
                    className="transition-colors hover:text-white"
                  >
                    {t("legalNotices")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("contact")}</h4>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${t("email")}`}
                    className="transition-colors hover:text-white"
                  >
                    {t("email")}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{t("address")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="flex-1 max-w-md">
              <h4 className="text-sm font-semibold mb-2">{t("newsletter")}</h4>
              <p className="text-sm text-slate-300 mb-4">
                {t("newsletterDescription")}
              </p>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {t("subscribe")}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-slate-300">
              {t("copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
