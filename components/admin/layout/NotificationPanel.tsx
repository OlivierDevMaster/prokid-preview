"use client";

import { useState } from "react";
import { Bell, UserPlus, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "team_invitation" | "mission_request";
  title: string;
  description: string;
  sender: string;
  date: string;
  isRead?: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function NotificationPanel({
  notifications,
  onAccept,
  onDecline,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "team_invitation":
        return <UserPlus className="h-5 w-5 text-gray-400" />;
      case "mission_request":
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-bold text-gray-900">Notifications</h3>
        <p className="text-sm text-gray-700 mt-1">
          {unreadCount} nouvelle(s) notification(s)
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-gray-900">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {notification.date}
                        </span>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mt-1">
                      {notification.description}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      De: {notification.sender}
                    </p>

                    {notification.type === "team_invitation" && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 h-auto"
                          onClick={() => onAccept?.(notification.id)}
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-sm px-3 py-1.5 h-auto bg-white hover:bg-gray-50"
                          onClick={() => onDecline?.(notification.id)}
                        >
                          <X className="h-4 w-4 mr-1.5" />
                          Décliner
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

