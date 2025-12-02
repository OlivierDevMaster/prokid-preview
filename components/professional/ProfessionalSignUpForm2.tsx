"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Step1ProfilePhoto } from "@/components/sign-up/steps/Step1ProfilePhoto";
import { Step2IdentityInfo } from "@/components/sign-up/steps/Step2IdentityInfo";
import { Step3Planning } from "@/components/sign-up/steps/Step3Planning";
import { Step4Finalization } from "@/components/sign-up/steps/Step4Finalization";
import type { DaySchedule } from "@/components/sign-up/steps/Step3Planning";

const initialSchedule: Record<string, DaySchedule> = {
  monday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
  tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
  wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
  thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
  friday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] },
};

export default function ProfessionalSignUpForm2() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
    city: "",
    postalCode: "",
    email: "",
    phone: "",
    description: "",
    yearsExperience: "",
    hourlyRate: "",
    interventionZone: 25,
  });
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(initialSchedule);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Submitting form:", {
      profilePhoto,
      formData,
      schedule,
    });
    // TODO: Implement actual submission logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full  bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">PROKid</h1>
          <p className="text-gray-600 text-sm">
            Configuration de votre profil professionnel
          </p>
        </div>

        {currentStep === 1 && (
          <Step1ProfilePhoto
            onNext={handleNext}
            profilePhoto={profilePhoto}
            onPhotoChange={setProfilePhoto}
          />
        )}

        {currentStep === 2 && (
          <Step2IdentityInfo
            onNext={handleNext}
            onPrevious={handlePrevious}
            formData={formData}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
          />
        )}

        {currentStep === 3 && (
          <Step3Planning
            onNext={handleNext}
            onPrevious={handlePrevious}
            schedule={schedule}
            onScheduleChange={setSchedule}
          />
        )}

        {currentStep === 4 && (
          <Step4Finalization
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
          />
        )}
      </Card>
    </div>
  );
}
