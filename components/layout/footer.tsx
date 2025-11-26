"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const title = useTranslations("title");

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{title("project")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("description")}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("links")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("home")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("contact")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("legal")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("terms")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t("contact")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("contactDescription")}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {t("copyright")}
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                {t("language")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

