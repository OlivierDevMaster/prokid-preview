"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StructureCard, type Structure } from "@/components/admin/structure/StructureCard";

const mockStructures: Structure[] = [
  {
    id: "1",
    name: "Micro-crèche Les Petits Loups",
    location: "Paris 15ème",
    email: "contact@petitsloups.fr",
    hoursCompleted: 32,
    hoursTotal: 80,
    lastReportDate: "15/12/2024",
    status: "on_time",
  },
  {
    id: "2",
    name: "Crèche Familiale Arc-en-Ciel",
    location: "Lyon 6ème",
    email: "direction@arcenciel.fr",
    hoursCompleted: 18,
    hoursTotal: 50,
    lastReportDate: "10/12/2024",
    status: "to_monitor",
  },
];

export default function StructuresPage() {
  const [structures] = useState<Structure[]>(mockStructures);

  const handleAddStructure = () => {
    console.log("Add structure");
  };

  const handleViewDetails = (id: string) => {
    console.log("View details for structure:", id);
  };

  return (
    <div className="space-y-6 min-h-screen bg-blue-50/30 -m-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes structures</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos interventions et suivis pour chaque établissement
          </p>
        </div>
        <Button
          onClick={handleAddStructure}
          className="bg-blue-400 hover:bg-blue-500 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une structure
        </Button>
      </div>

      {/* Structures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {structures.map((structure) => (
          <StructureCard
            key={structure.id}
            structure={structure}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {structures.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Aucune structure pour le moment.</p>
          <Button
            onClick={handleAddStructure}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une structure
          </Button>
        </div>
      )}
    </div>
  );
}

