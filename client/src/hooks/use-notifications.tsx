import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast({
          title: "Notifications enabled!",
          description: "You'll now receive task reminders.",
        });
        return true;
      } else {
        toast({
          title: "Notifications disabled",
          description: "You can enable them later in your browser settings.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const scheduleNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== "granted") {
      return false;
    }

    try {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
      return true;
    } catch (error) {
      console.error("Failed to show notification:", error);
      return false;
    }
  }, [permission]);

  const showTaskReminder = useCallback((taskTitle: string, isFollowUp = false) => {
    const title = isFollowUp ? "Task Follow-up" : "Task Reminder";
    const body = isFollowUp 
      ? `Still pending: ${taskTitle}`
      : `Time to complete: ${taskTitle}`;

    return scheduleNotification(title, {
      body,
      tag: `task-reminder-${Date.now()}`,
      requireInteraction: true,
    });
  }, [scheduleNotification]);

  return {
    permission,
    requestPermission,
    scheduleNotification,
    showTaskReminder,
  };
}
