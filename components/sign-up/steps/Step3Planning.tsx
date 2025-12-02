"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "../ProgressBar";
import { Clock } from "lucide-react";

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface Step3PlanningProps {
  onNext: () => void;
  onPrevious: () => void;
  schedule: Record<string, DaySchedule>;
  onScheduleChange: (schedule: Record<string, DaySchedule>) => void;
}

const days = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

export function Step3Planning({
  onNext,
  onPrevious,
  schedule,
  onScheduleChange,
}: Step3PlanningProps) {
  const handleDayToggle = (dayKey: string) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        enabled: !schedule[dayKey].enabled,
      },
    };
    onScheduleChange(newSchedule);
  };

  const handleAddSlot = (dayKey: string) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: [...schedule[dayKey].slots, { start: "09:00", end: "17:00" }],
      },
    };
    onScheduleChange(newSchedule);
  };

  const handleSlotChange = (
    dayKey: string,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    const newSchedule = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: schedule[dayKey].slots.map((slot, idx) =>
          idx === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    };
    onScheduleChange(newSchedule);
  };

  const handleCopyMonday = () => {
    const mondaySchedule = schedule.monday;
    const newSchedule = { ...schedule };
    days.forEach((day) => {
      if (day.key !== "monday") {
        newSchedule[day.key] = {
          enabled: mondaySchedule.enabled,
          slots: [...mondaySchedule.slots],
        };
      }
    });
    onScheduleChange(newSchedule);
  };

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={3} totalSteps={4} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Planning & disponibilités
        </h1>
        <p className="text-gray-600">
          Configurez vos jours et créneaux disponibles
        </p>
      </div>

      <Button
        type="button"
        onClick={handleCopyMonday}
        variant="outline"
        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Copier les horaires du lundi à tous les jours
      </Button>

      <div className="space-y-4">
        {days.map((day) => (
          <div
            key={day.key}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={day.key}
                  checked={schedule[day.key].enabled}
                  onCheckedChange={() => handleDayToggle(day.key)}
                />
                <Label
                  htmlFor={day.key}
                  className="text-lg font-bold text-gray-900 cursor-pointer"
                >
                  {day.label}
                </Label>
              </div>
              {!schedule[day.key].enabled && (
                <span className="text-sm text-gray-500">Non travaillé</span>
              )}
            </div>

            {schedule[day.key].enabled && (
              <div className="space-y-3 pl-8">
                {schedule[day.key].slots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="grid grid-cols-2 gap-4 items-end"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Début</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            handleSlotChange(day.key, slotIndex, "start", e.target.value)
                          }
                          className="border-gray-300 pr-10"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Fin</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            handleSlotChange(day.key, slotIndex, "end", e.target.value)
                          }
                          className="border-gray-300 pr-10"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddSlot(day.key)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  + Ajouter un créneau
                </button>
              </div>
            )}
          </div>
        ))}
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

