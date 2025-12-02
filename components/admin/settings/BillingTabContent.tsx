import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const BillingTabContent = () => {

  return (
    <div className="border border-gray-200 rounded-md p-4">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <div className="flex justify-between gap-4 border border-gray-200 p-4 my-2 rounded-md bg-blue-50/30">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Payment Methods</h2>
          <p className="text-sm text-gray-600">Essai gratuit activ</p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Payment Methods</h2>
          <p className="text-sm text-gray-600">Essai gratuit activ</p>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 border border-gray-200 p-4 my-2 rounded-md bg-green-50/30">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Payment Methods</h2>
          <p className="text-sm text-gray-600">Essai gratuit activ</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
            <PlusIcon className="w-4 h-4" />
            Add Payment Method
          </Button>
          <Button className="rounded-lg" variant="outline">
            <PlusIcon className="w-4 h-4" />
            Add Payment Method
          </Button>
        </div>
      </div>
      <div>
        <div className="flex flex-start flex-col">
          <div className="text-lg font-bold text-gray-800">Informations</div>
          <div className="flex items-center gap-2 py-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <div className="text-gray-700">Paiement sécurisé via stripe</div>
          </div>
          <div className="flex items-center gap-2 py-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <div className="text-gray-700">Paiement sécurisé via stripe</div>
          </div>
          <div className="flex items-center gap-2 py-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <div className="text-gray-700">Paiement sécurisé via stripe</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingTabContent;
