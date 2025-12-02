"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PersonalInfoForm() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-blue-900">
        Informations personnelles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            Prénom *
          </Label>
          <Input
            id="firstName"
            type="text"
            defaultValue="Marie"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Nom *
          </Label>
          <Input
            id="lastName"
            type="text"
            defaultValue="Joux"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Adresse e-mail *
          </Label>
          <Input
            id="email"
            type="email"
            defaultValue="marie.joux@prokid.fr"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Numéro de téléphone
          </Label>
          <Input
            id="phone"
            type="tel"
            defaultValue="06 12 34 56 78"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

