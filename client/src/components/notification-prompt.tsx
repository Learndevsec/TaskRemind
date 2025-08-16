import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

export function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const { permission, requestPermission } = useNotifications();

  useEffect(() => {
    // Show prompt after 2 seconds if permission is default
    if (permission === "default") {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [permission]);

  const handleEnable = async () => {
    await requestPermission();
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || permission !== "default") {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 bg-white rounded-xl card-shadow p-4 z-40" data-testid="notification-prompt">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Bell className="text-white w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">Enable Notifications</h4>
          <p className="text-sm text-gray-600 mb-3">
            Get timely reminders for your tasks. We'll only send notifications you've scheduled.
          </p>
          <div className="flex space-x-2">
            <Button 
              onClick={handleEnable}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium ripple"
              data-testid="button-enable-notifications"
            >
              Enable
            </Button>
            <Button 
              variant="ghost"
              onClick={handleClose}
              className="text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
              data-testid="button-not-now"
            >
              Not Now
            </Button>
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600"
          data-testid="button-close-prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
