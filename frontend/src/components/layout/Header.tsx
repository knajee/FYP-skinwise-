"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { getPageTitle } from "@/lib/pageTitles";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/lib/routes";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const pathname = usePathname();
  const displayTitle = title || getPageTitle(pathname);
  
  const user = useAuthStore((s) => s.user);
  const email = user?.email || "";
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <header className="md:hidden h-14 bg-white border-b border-border-default flex items-center justify-between px-4 sticky top-0 z-30">
      <h1 className="font-display text-lg text-text-primary">{displayTitle}</h1>
      
      <div className="flex items-center gap-3">
        <button 
          className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-full transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {/* Optional: unread indicator badge could go here */}
        </button>
        
        <Link 
          href={ROUTES.PROFILE}
          className="w-8 h-8 rounded-full bg-brand text-text-inverse flex items-center justify-center text-sm font-medium"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}
