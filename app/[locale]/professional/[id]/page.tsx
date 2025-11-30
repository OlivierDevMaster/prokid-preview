import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar as CalendarIcon,
  Star,
  Mail,
  Heart,
  CheckCircle2,
  Euro,
  Divide,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AvailabilityCalendar } from "@/components/professional/availability-calendar";
import Image from "next/image";

// Mock data - À remplacer par un appel API/service
const MOCK_PROFESSIONALS = [
  {
    id: "1",
    name: "Marie Dubois",
    role: "Éducateur de jeunes enfants",
    location: "Brest, Finistère",
    distance: 15,
    availability: "Lundi-Vendredi matin",
    description:
      "Éducatrice de jeunes enfants passionnée avec 8 ans d'expérience. Spécialisée dans l'accompagnement des enfants en situation de handicap et dans les méthodes Montessori. J'aime créer des activités ludiques qui favorisent l'autonomie et l'épanouissement de chaque enfant.",
    skills: [
      "Montessori",
      "Troubles neurodéveloppementaux",
      "Créativité",
      "Développement social",
    ],
    rating: 4.8,
    reviewsCount: 12,
    hourlyRate: 35,
    dailyRate: 250,
    email: "marie.dubois@example.com",
    phone: "+33 6 12 34 56 78",
    experience: "8 ans",
    isVerified: true,
    isAvailable: true,
    isCertified: true,
    imageUrl: "/placeholder-avatar.jpg",
  },
  {
    id: "2",
    name: "Claire Le Goff",
    role: "RSAI",
    location: "Quimper",
    distance: 20,
    availability: "Lundi-Vendredi matin",
    description:
      "Spécialisée dans l'accompagnement des enfants en situation de handicap, je propose un suivi personnalisé et adapté à chaque besoin.",
    skills: ["Santé", "Inclusion", "Handicap", "Accompagnement", "Formation"],
    rating: 4.8,
    reviewsCount: 15,
    hourlyRate: 45,
    dailyRate: 300,
    email: "claire.legoff@example.com",
    phone: "+33 6 12 34 56 78",
    experience: "10 ans",
    isVerified: true,
    isAvailable: true,
    isCertified: true,
  },
];

interface ProfessionalProfilePageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function ProfessionalProfilePage({
  params,
}: ProfessionalProfilePageProps) {
  const { id } = await params;
  const t = await getTranslations("professional.profile");

  // Trouver le professionnel - À remplacer par un appel API/service
  const professional = MOCK_PROFESSIONALS.find((p) => p.id === id);

  if (!professional) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t("notFound")}
          </h1>
          <Link href="/professional">
            <Button>{t("backToList")}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne gauche - Profil du professionnel */}
          <div className="lg:col-span-1">
            <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-8">
                {/* Header du profil */}
                <div className="flex gap-6 mb-8 flex-col items-center">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                      {professional.imageUrl ? (
                        <Image
                          src={professional.imageUrl}
                          alt={professional.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-semibold text-gray-500">
                          {professional.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                      {professional.name}
                    </h1>
                    <p className="text-lg text-gray-700 mb-3">
                      {professional.role}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {professional.isVerified && (
                        <Badge className="bg-green-400/60 text-white hover:bg-green-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t("verified")}
                        </Badge>
                      )}
                      {professional.isAvailable && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {t("available")}
                        </Badge>
                      )}
                    </div>

                    {/* Note */}
                    <div className="flex items-center gap-1 mb-4">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold text-gray-800">
                        {professional.rating}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({professional.reviewsCount} {t("reviews")})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full border my-4"></div>
                {/* Spécialités */}
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    {t("specialties")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {professional.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="w-full border my-4"></div>

                {/* Localisation et expérience */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {professional.location} • {t("sector")} {professional.distance}{" "}
                      {t("km")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>
                      {professional.experience} {t("experience")}
                      {professional.isCertified && (
                        <span className="ml-2">• {t("certifiedProfessional")}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Tarifs */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-800">
                      {professional.hourlyRate}€/{t("hour")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-800">
                      {professional.dailyRate}€/{t("day")}
                    </span>
                  </div>
                </div>

                <div className="w-full border my-4"></div>

                {/* Boutons d'action */}
                <div className="flex gap-3 mb-8 flex-col">
                  <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    {t("sendMessage")}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Heart className="h-4 w-4" />
                    {t("addFavorite")}
                  </Button>
                </div>

                {/* Section À propos */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">
                    {t("about")}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {professional.description}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Colonne droite - Calendrier de disponibilités */}
          <div className="lg:col-span-2">
            <AvailabilityCalendar professionalId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
