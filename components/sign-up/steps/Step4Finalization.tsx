"use client";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "../ProgressBar";

interface Step4FinalizationProps {
  onPrevious: () => void;
  onSubmit: () => void;
}

export function Step4Finalization({
  onPrevious,
  onSubmit,
}: Step4FinalizationProps) {
  return (
    <div className="space-y-6">
      <ProgressBar currentStep={4} totalSteps={4} />

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Finalisation
        </h1>
        <p className="text-gray-600">
          Vérifiez vos informations avant de finaliser votre inscription
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2">
        <h3 className="font-semibold text-gray-900">
          Votre profil est presque prêt !
        </h3>
        <p className="text-sm text-gray-600">
          En cliquant sur "Finaliser", vous acceptez nos conditions
          d'utilisation et notre politique de confidentialité.
        </p>
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
          onClick={onSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Finaliser l'inscription
        </Button>
      </div>
    </div>
  );
}

