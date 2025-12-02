"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Structure {
  id: string;
  name: string;
  location: string;
  email: string;
  hoursCompleted: number;
  hoursTotal: number;
  lastReportDate: string;
  status: "on_time" | "to_monitor";
}

interface StructureCardProps {
  structure: Structure;
  onViewDetails?: (id: string) => void;
}

export function StructureCard({ structure, onViewDetails }: StructureCardProps) {
  const progressPercentage = (structure.hoursCompleted / structure.hoursTotal) * 100;
  const remainingHours = structure.hoursTotal - structure.hoursCompleted;

  const statusConfig = {
    on_time: {
      label: "Dans les temps",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      dotColor: "bg-green-500",
    },
    to_monitor: {
      label: "À surveiller",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      dotColor: "bg-orange-500",
    },
  };

  const status = statusConfig[structure.status];

  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {structure.name}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{structure.location}</span>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded-full flex items-center gap-1.5",
              status.bgColor,
              status.textColor
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", status.dotColor)} />
            <span className="text-xs font-medium">{status.label}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{structure.email}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Heures effectuées</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                  <div
                    className="bg-green-200 h-full"
                    style={{ width: `${100 - progressPercentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {structure.hoursCompleted}h / {structure.hoursTotal}h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4 text-gray-400" />
            <span>Dernier compte rendu</span>
            <span className="text-gray-500">{structure.lastReportDate}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => onViewDetails?.(structure.id)}
        >
          Voir les détails
        </Button>
      </div>
    </Card>
  );
}

