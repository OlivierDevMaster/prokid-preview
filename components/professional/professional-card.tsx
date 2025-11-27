"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Star, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfessionalCardProps {
  name: string;
  role: string;
  location: string;
  distance: number;
  availability: string;
  description: string;
  skills: string[];
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  imageUrl?: string;
}

export function ProfessionalCard({
  name,
  role,
  location,
  distance,
  availability,
  description,
  skills,
  rating,
  reviewsCount,
  hourlyRate,
  imageUrl,
}: ProfessionalCardProps) {
  const t = useTranslations("professional.card");

  return (
    <Card className="bg-white rounded-lg border border-green-100/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-gray-500">
                  {name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-3">{role}</p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {location} • {t("upTo")} {distance} {t("km")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{availability}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-800">
                    {rating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviewsCount} {t("reviews")})
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-4">
                  {hourlyRate}€{t("hourlyRate")}
                </p>
                <Button size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  {t("viewProfile")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

