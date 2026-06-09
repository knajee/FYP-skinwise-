"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, FlaskConical, User } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const TABS = [
  { href: ROUTES.DASHBOARD, label: "Home", icon: LayoutDashboard },
  { href: ROUTES.CHECK_IN, label: "Check-In", icon: Camera, isFab: true },
  { href: ROUTES.INGREDIENTS, label: "Actives", icon: FlaskConical },
  { href: ROUTES.PROFILE, label: "Profile", icon: User },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border-default z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around h-16 relative">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          if (tab.isFab) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative -top-5 flex flex-col items-center group"
                aria-label={tab.label}
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95",
                  isActive 
                    ? "bg-accent text-text-primary" 
                    : "bg-brand text-text-primary"
                )}>
                  <Icon size={24} />
                </div>
                <span className="text-[10px] font-medium text-text-primary mt-1">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center pb-2 h-full gap-1 active:bg-bg-subtle/50 transition-colors"
            >
              <Icon 
                size={20} 
                className={cn("transition-colors", isActive ? "text-accent" : "text-text-tertiary")} 
              />
              <span className={cn("text-[10px] font-medium", isActive ? "text-text-primary" : "text-text-tertiary")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
