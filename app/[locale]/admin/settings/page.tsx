"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PersonalInfoForm } from "@/components/admin/settings/PersonalInfoForm";
import { PasswordChangeForm } from "@/components/admin/settings/PasswordChangeForm";
import { NotificationPreferences } from "@/components/admin/settings/NotificationPreferences";
import { cn } from "@/lib/utils";
import BillingTabContent from "@/components/admin/settings/BillingTabContent";

type TabType = "profil" | "disponibilites" | "facturation";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profil");

  const tabs = [
    { id: "profil" as TabType, label: "Profil" },
    { id: "disponibilites" as TabType, label: "Disponibilités" },
    { id: "facturation" as TabType, label: "Facturation" },
  ];

  const handleSave = () => {
    console.log("Saving changes...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Paramètres du profil
          </h1>
        </div>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-green-300/50 p-1 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-green-50",
              activeTab === tab.id
                ? "bg-green-50 text-blue-900"
                : ""
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <Card className="border border-gray-200 rounded-lg bg-white">
        <div className="p-6 space-y-6">
          {activeTab === "profil" && (
            <>
              <PersonalInfoForm />
              <PasswordChangeForm />
              <NotificationPreferences />
            </>
          )}
          {activeTab === "disponibilites" && (
            <div className="text-center py-12 text-gray-500">
              Section Disponibilités à venir
            </div>
          )}
          {activeTab === "facturation" && (
            <BillingTabContent />
          )}
        </div>
      </Card>
    </div>
  );
}

