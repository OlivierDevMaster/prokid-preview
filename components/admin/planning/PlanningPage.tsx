"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Clock, TrendingUp, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { format, startOfWeek, addWeeks, subWeeks, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

export function PlanningPage() {
  const t = useTranslations("admin.planning");
  // Initialiser avec une date fixe pour éviter les problèmes d'hydratation
  // Utiliser useState avec une fonction pour garantir la même valeur entre serveur et client
  const [currentWeek, setCurrentWeek] = useState(() => new Date(2025, 10, 24)); // 24 novembre 2025
  const [mounted, setMounted] = useState(false);

  // S'assurer que le composant est monté côté client avant d'utiliser des valeurs dynamiques
  useEffect(() => {
    setMounted(true);
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  // Mock data - À remplacer par des données réelles
  const stats = {
    fillRate: 0,
    bookedHours: 0,
    availableSlots: 0,
    estimatedRevenue: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-900">{t("title")}</h1>
        <Button variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-50">
          <Pencil className="h-4 w-4 mr-2" />
          {t("modifyAvailabilities")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Taux de remplissage */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t("fillRate")}</h3>
            <div className="text-3xl font-bold text-blue-900 mb-3">{stats.fillRate}%</div>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.fillRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Heures réservées */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{t("bookedHours")}</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-1">{stats.bookedHours}h</div>
            <p className="text-sm text-gray-500">{t("thisWeek")}</p>
          </div>
        </Card>

        {/* Créneaux disponibles */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{t("availableSlots")}</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.availableSlots}</div>
            <p className="text-sm text-gray-500">{t("toBook")}</p>
          </div>
        </Card>

        {/* Revenus estimés */}
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{t("estimatedRevenue")}</h3>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-1">{stats.estimatedRevenue}€</div>
            <p className="text-sm text-gray-500">{t("thisWeek")}</p>
          </div>
        </Card>
      </div>

      {/* Weekly Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousWeek}
          className="text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("previousWeek")}
        </Button>
        <h2 className="text-lg font-bold text-blue-900">
          {t("weekOf")} {format(weekStart, "d MMMM yyyy", { locale: fr })}
        </h2>
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          // Utiliser mounted pour éviter les différences d'hydratation
          const isToday = mounted && isSameDay(day, new Date());
          const dayName = dayNames[index];
          const dayNumber = format(day, "d");
          const month = format(day, "MMM", { locale: fr });

          return (
            <Card
              key={index}
              className={`bg-white rounded-lg border-2 shadow-sm min-h-[200px] ${
                isToday
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="p-4">
                <div className="text-sm font-bold text-blue-900 mb-1">{dayName}</div>
                <div className="text-sm text-blue-900 mb-4">
                  {dayNumber} {month}
                </div>
                {/* Ici on peut ajouter les créneaux/réservations */}
                <div className="space-y-2">
                  {/* Les créneaux seront ajoutés ici */}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

