"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const t = useTranslations("faq");

  const faqItems = [
    {
      key: "whoCanUse",
      question: t("items.whoCanUse.question"),
      answer: t("items.whoCanUse.answer"),
    },
    {
      key: "professionalTypes",
      question: t("items.professionalTypes.question"),
      answer: t("items.professionalTypes.answer"),
    },
    {
      key: "publicStructures",
      question: t("items.publicStructures.question"),
      answer: t("items.publicStructures.answer"),
    },
    {
      key: "freeTrial",
      question: t("items.freeTrial.question"),
      answer: t("items.freeTrial.answer"),
    },
    {
      key: "automaticAppointments",
      question: t("items.automaticAppointments.question"),
      answer: t("items.automaticAppointments.answer"),
    },
    {
      key: "payments",
      question: t("items.payments.question"),
      answer: t("items.payments.answer"),
    },
    {
      key: "availability",
      question: t("items.availability.question"),
      answer: t("items.availability.answer"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-700 text-center mb-12">
          {t("title")}
        </h1>

        <Accordion
          type="single"
          collapsible
          defaultValue="whoCanUse"
          className="space-y-3"
        >
          {faqItems.map((item) => (
            <AccordionItem
              key={item.key}
              value={item.key}
              className="bg-white rounded-lg border border-green-100/50 px-6 shadow-sm data-[state=closed]:bg-green-50/30"
            >
              <AccordionTrigger className="text-left font-medium text-gray-800 hover:no-underline py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

