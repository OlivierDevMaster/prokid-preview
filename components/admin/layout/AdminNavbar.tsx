"use client";

import { useState } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationPanel, type Notification } from "./NotificationPanel";
import { useRouter } from "next/navigation";

interface AdminNavbarProps {
  userRole?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "team_invitation",
    title: "Invitation d'équipe",
    description: "Micro-crèche Nawan vous invite à rejoindre leur équipe",
    sender: "Micro-crèche Nawan",
    date: "15/01/2024",
    isRead: false,
  },
  {
    id: "2",
    type: "mission_request",
    title: "Nouvelle demande de mission",
    description: "Crèche Les Bambins souhaite programmer une intervention",
    sender: "Crèche Les Bambins",
    date: "14/01/2024",
    isRead: false,
  },
];

export function AdminNavbar({ userRole = "Professionnel(le) petite enfance" }: AdminNavbarProps) {
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleAccept = (id: string) => {
    console.log("Accept notification:", id);
  };

  const handleDecline = (id: string) => {
    console.log("Decline notification:", id);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-blue-50 rounded-full">
              <span className="text-sm font-medium text-blue-700">
                {userRole}
              </span>
            </div>

            <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-auto p-0 border-gray-200 shadow-xl"
              >
                <NotificationPanel
                  notifications={notifications}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100"
              onClick={() => router.push("/admin/settings")}
            >
              <Settings className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

