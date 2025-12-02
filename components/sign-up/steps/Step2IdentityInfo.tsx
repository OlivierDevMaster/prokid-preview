"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "../ProgressBar";
import { ChevronDown } from "lucide-react";

interface Step2IdentityInfoProps {
  onNext: () => void;
  onPrevious: () => void;
  formData: {
    firstName: string;
    lastName: string;
    profession: string;
    city: string;
    postalCode: string;
    email: string;
    phone: string;
    description: string;
    yearsExperience: string;
    hourlyRate: string;
    interventionZone: number;
  };
  onFormDataChange: (data: Partial<Step2IdentityInfoProps["formData"]>) => void;
}

const professions = [
  "Psychomotricien",
  "Éducateur de jeunes enfants",
  "Auxiliaire de puériculture",
  "Infirmier(ère)",
  "Autre",
];

export function Step2IdentityInfo({
  onNext,
  onPrevious,
  formData,
  onFormDataChange,
}: Step2IdentityInfoProps) {
  const handleChange = (field: string, value: string | number) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={2} totalSteps={4} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Identité & informations
        </h1>
        <p className="text-gray-600">
          Complétez votre profil professionnel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-gray-700">
            Prénom *
          </Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="border-gray-300"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-gray-700">
            Nom *
          </Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="border-gray-300"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession" className="text-gray-700">
            Profession *
          </Label>
          <div className="relative">
            <select
              id="profession"
              value={formData.profession}
              onChange={(e) => handleChange("profession", e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none"
              required
            >
              <option value="">Sélectionnez une profession</option>
              {professions.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-gray-700">
            Ville *
          </Label>
          <Input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="border-gray-300"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-gray-700">
            Code postal
          </Label>
          <Input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            className="border-gray-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">
          Zone d'intervention : {formData.interventionZone} km
        </Label>
        <div className="relative w-full h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-full rounded-full bg-blue-500"
            style={{ width: `${(formData.interventionZone / 100) * 100}%` }}
          />
          <div
            className="absolute h-full rounded-full bg-green-200 right-0"
            style={{
              width: `${((100 - formData.interventionZone) / 100) * 100}%`,
            }}
          />
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={formData.interventionZone}
            onChange={(e) =>
              handleChange("interventionZone", parseInt(e.target.value))
            }
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider"
            style={{
              background: "transparent",
            }}
          />
        </div>
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Email professionnel *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="border-gray-300"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">
            Téléphone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="border-gray-300"
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700">
          Description
        </Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Présentez votre parcours et vos valeurs..."
          className="w-full min-h-[120px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearsExperience" className="text-gray-700">
            Années d'expérience
          </Label>
          <Input
            id="yearsExperience"
            type="number"
            value={formData.yearsExperience}
            onChange={(e) => handleChange("yearsExperience", e.target.value)}
            className="border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourlyRate" className="text-gray-700">
            Tarif horaire (€)
          </Label>
          <Input
            id="hourlyRate"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => handleChange("hourlyRate", e.target.value)}
            className="border-gray-300"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          ← Précédent
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Suivant →
        </Button>
      </div>
    </div>
  );
}

