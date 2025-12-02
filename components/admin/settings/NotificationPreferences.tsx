"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface NotificationPreference {
  id: string;
  label: string;
  checked: boolean;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "appointment_reminders",
      label:
        "Recevoir des rappels de rendez-vous par e-mail (24h avant)",
      checked: true,
    },
    {
      id: "new_interventions",
      label: "Recevoir les notifications de nouvelles demandes d'intervention",
      checked: true,
    },
    {
      id: "report_confirmation",
      label: "Recevoir une confirmation d'envoi des rapports",
      checked: false,
    },
    {
      id: "newsletter",
      label: "Recevoir les actualités et conseils ProKid par e-mail",
      checked: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, checked: !pref.checked } : pref
      )
    );
  };

  return (
    <div className="space-y-4 border-t border-gray-200 pt-6">
      <h2 className="text-lg font-bold text-blue-900">
        Préférences de notification
      </h2>

      <div className="space-y-4">
        {preferences.map((preference) => (
          <div key={preference.id} className="flex items-start gap-3">
            <Checkbox
              id={preference.id}
              checked={preference.checked}
              onCheckedChange={() => handleToggle(preference.id)}
              className="mt-1"
            />
            <Label
              htmlFor={preference.id}
              className="text-sm text-gray-700 cursor-pointer flex-1"
            >
              {preference.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

