"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { format, startOfWeek, addWeeks, subWeeks, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

interface AvailabilityCalendarProps {
  professionalId: string;
}

// Mock data pour les disponibilités
const MOCK_AVAILABILITIES: Record<string, string[]> = {
  "2025-11-27": ["09:00", "14:00"],
  "2025-11-29": ["09:00", "14:00"],
};

export function AvailabilityCalendar({
  professionalId,
}: AvailabilityCalendarProps) {
  const t = useTranslations("professional.profile.calendar");
  const [currentWeek, setCurrentWeek] = useState(new Date(2025, 10, 24)); // 24 novembre 2025

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const isCurrentWeek = isSameDay(
    startOfWeek(currentWeek, { weekStartsOn: 1 }),
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const getAvailableSlots = (date: Date): string[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return MOCK_AVAILABILITIES[dateKey] || [];
  };

  const totalAvailableSlots = weekDays.reduce(
    (total, day) => total + getAvailableSlots(day).length,
    0
  );

  const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">{t("title")}</h3>
          </div>
          {totalAvailableSlots > 0 && (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              {totalAvailableSlots} {t("freeSlots")}
            </Badge>
          )}
        </div>

        {/* Semaine */}
        <p className="text-sm text-gray-600 mb-4">
          {t("weekOf")} {format(weekStart, "d MMMM yyyy", { locale: fr })}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousWeek}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("previousWeek")}
          </Button>
          <Button
            variant={isCurrentWeek ? "default" : "ghost"}
            size="sm"
            onClick={goToCurrentWeek}
            className={isCurrentWeek ? "bg-blue-500 text-white" : "text-gray-600"}
          >
            {t("thisWeek")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextWeek}
            className="text-gray-600 hover:text-gray-800"
          >
            {t("nextWeek")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Calendrier */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, index) => {
            const slots = getAvailableSlots(day);
            const isToday = isSameDay(day, new Date());
            const dayName = dayNames[index];
            const dayNumber = format(day, "d");
            const month = format(day, "MMM", { locale: fr });

            return (
              <div
                key={index}
                className={`border rounded-lg p-3 min-h-[120px] ${
                  isToday
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  {dayName}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {dayNumber} {month}
                </div>
                {slots.length > 0 ? (
                  <div className="space-y-1">
                    {slots.map((slot, slotIndex) => (
                      <Button
                        key={slotIndex}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="h-px bg-gray-200 mt-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {t("howToBook")}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t("bookingInstructions")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

