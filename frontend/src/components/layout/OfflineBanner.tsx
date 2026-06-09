"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "react-hot-toast";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check (won't work reliably on SSR, so defaults to false, then updates)
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Back online", {
        id: "network-status",
        icon: "🟢",
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error("You are offline", {
        id: "network-status",
        icon: "🔴",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="w-full bg-severity-moderate text-text-primary px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium animate-in slide-in-from-top z-50 sticky top-0 md:top-auto">
      <WifiOff size={14} />
      You&apos;re offline — check-ins require an internet connection.
    </div>
  );
}
