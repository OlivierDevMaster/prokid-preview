"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "../ProgressBar";

interface Step1ProfilePhotoProps {
  onNext: () => void;
  profilePhoto?: File | null;
  onPhotoChange: (file: File | null) => void;
}

export function Step1ProfilePhoto({
  onNext,
  profilePhoto,
  onPhotoChange,
}: Step1ProfilePhotoProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDefault = () => {
    onPhotoChange(null);
    setPreview(null);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={1} totalSteps={4} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Photo de profil</h1>
        <p className="text-gray-600">
          Choisissez une photo professionnelle et souriante
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-semibold text-gray-500">kk</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCameraClick}
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center shadow-md hover:bg-blue-500 transition-colors"
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-gray-500">Format carré recommandé</p>
        <Button
          type="button"
          variant="outline"
          onClick={handleUseDefault}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Utiliser une photo par défaut
        </Button>
      </div>

      <div className="flex justify-end pt-4">
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

