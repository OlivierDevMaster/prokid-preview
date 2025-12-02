"use client";

import { useReports } from "@/hooks/admin/useReports";
import { ReportTable } from "./ReportTable";
import { useTranslations } from "next-intl";

interface ReportsListProps {
  locale?: string;
}

export function ReportsList({ locale = "en" }: ReportsListProps) {
  const t = useTranslations("admin.reports");
  const { data: reports = [], isLoading, error } = useReports();

  const translations = {
    title: t("titleColumn"),
    contents: t("contentsColumn"),
    createdAt: t("createdAt"),
    previous: t("previous"),
    next: t("next"),
    page: t("page"),
    of: t("of"),
    noResults: t("noResults"),
    view: t("view"),
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {t("error")}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t("noReports")}
      </div>
    );
  }

  return <ReportTable data={reports} locale={locale} translations={translations} />;
}

