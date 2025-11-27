"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import { ProfessionalCard } from "@/components/professional/professional-card";

const MOCK_PROFESSIONALS = [
  {
    id: 1,
    name: "Claire Le Goff",
    role: "RSAI",
    location: "Quimper",
    distance: 20,
    availability: "Lundi-Vendredi matin",
    description:
      "Spécialisée dans l'accompagnement des enfants en situation de handicap, je propose un suivi personnalisé et adapté à chaque besoin.",
    skills: ["Santé", "Inclusion", "Handicap"],
    rating: 4.8,
    reviewsCount: 15,
    hourlyRate: 45,
  },
  {
    id: 2,
    name: "Julie Martin",
    role: "Référente Technique",
    location: "Brest",
    distance: 15,
    availability: "Mardi-Jeudi après-midi",
    description:
      "Experte en développement de l'enfant et en pédagogie, j'accompagne les équipes dans leurs pratiques professionnelles.",
    skills: ["Formation", "Pédagogie", "Équipe"],
    rating: 4.9,
    reviewsCount: 22,
    hourlyRate: 50,
  },
  {
    id: 3,
    name: "Thomas Bernard",
    role: "Psychomotricien",
    location: "Lorient",
    distance: 25,
    availability: "Lundi-Mercredi-Vendredi",
    description:
      "Spécialisé en psychomotricité relationnelle, je travaille sur le développement psychomoteur des jeunes enfants.",
    skills: ["Psychomotricité", "Développement", "Relation"],
    rating: 4.7,
    reviewsCount: 18,
    hourlyRate: 42,
  },
  {
    id: 4,
    name: "Sophie Dubois",
    role: "EJE",
    location: "Vannes",
    distance: 30,
    availability: "Semaine complète",
    description:
      "Éducatrice de jeunes enfants avec une expertise en accueil collectif et en projet pédagogique.",
    skills: ["Accueil", "Projet", "Collectif"],
    rating: 4.6,
    reviewsCount: 12,
    hourlyRate: 40,
  },
  {
    id: 5,
    name: "Marie Leroy",
    role: "Diététicien",
    location: "Quimper",
    distance: 18,
    availability: "Mardi-Jeudi",
    description:
      "Diététicienne spécialisée en nutrition infantile, je propose des conseils adaptés aux besoins nutritionnels des tout-petits.",
    skills: ["Nutrition", "Infantile", "Conseil"],
    rating: 4.9,
    reviewsCount: 20,
    hourlyRate: 48,
  },
];

export default function ProfessionalPage() {
  const t = useTranslations("professional");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");

  const filteredProfessionals = MOCK_PROFESSIONALS.filter((prof) => {
    const matchesSearch =
      !searchQuery ||
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLocation =
      !locationQuery ||
      prof.location.toLowerCase().includes(locationQuery.toLowerCase());

    const matchesRole = selectedRole === "all" || prof.role === selectedRole;

    const matchesAvailability =
      selectedAvailability === "all" || true;

    return matchesSearch && matchesLocation && matchesRole && matchesAvailability;
  });

  const resultsCount = filteredProfessionals.length;

  return (
    <div className="min-h-screen bg-[#f5f7f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search.locationPlaceholder")}
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder={t("search.role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("roles.all")}</SelectItem>
                <SelectItem value="RSAI">{t("roles.rsai")}</SelectItem>
                <SelectItem value="Référente Technique">
                  {t("roles.technicalReferent")}
                </SelectItem>
                <SelectItem value="EJE">{t("roles.eje")}</SelectItem>
                <SelectItem value="Psychomotricien">
                  {t("roles.psychomotor")}
                </SelectItem>
                <SelectItem value="AP">{t("roles.ap")}</SelectItem>
                <SelectItem value="Diététicien">
                  {t("roles.dietitian")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedAvailability}
              onValueChange={setSelectedAvailability}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("search.availability")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("availability.all")}
                </SelectItem>
                <SelectItem value="morning">
                  {t("availability.morning")}
                </SelectItem>
                <SelectItem value="afternoon">
                  {t("availability.afternoon")}
                </SelectItem>
                <SelectItem value="fullDay">
                  {t("availability.fullDay")}
                </SelectItem>
                <SelectItem value="weekend">
                  {t("availability.weekend")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery ||
            locationQuery ||
            selectedRole !== "all" ||
            selectedAvailability !== "all") && (
            <div className="text-sm text-gray-600">
              {t("search.activeFilters")}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            <span className="font-semibold">{resultsCount}</span>{" "}
            {resultsCount === 1
              ? t("results.foundOne")
              : t("results.found")}
          </p>
        </div>

        <div className="space-y-4">
          {filteredProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              name={professional.name}
              role={professional.role}
              location={professional.location}
              distance={professional.distance}
              availability={professional.availability}
              description={professional.description}
              skills={professional.skills}
              rating={professional.rating}
              reviewsCount={professional.reviewsCount}
              hourlyRate={professional.hourlyRate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

