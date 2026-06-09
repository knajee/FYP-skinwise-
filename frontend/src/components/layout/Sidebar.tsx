"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, FlaskConical, User, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/lib/routes";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.CHECK_IN, label: "New Check-In", icon: Camera, isPrimary: true },
  { href: ROUTES.INGREDIENTS, label: "Ingredients", icon: FlaskConical },
  { href: ROUTES.PROFILE, label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logoutAction();
    logout();
    window.location.href = ROUTES.LOGIN;
  };

  // Extract initials from email or generic 'U'
  const email = user?.email || "";
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-[240px] bg-bg-surface border-r border-border-default z-40">
      {/* Top section — Logo */}
      <div className="h-[72px] flex items-center px-6 border-b border-border-default/50 shrink-0">
        <Link href={ROUTES.DASHBOARD} className="flex items-start">
          <span className="font-display italic text-2xl text-text-primary leading-none">
            Skin
          </span>
          <span className="font-sans font-semibold text-2xl text-text-primary leading-none tracking-tight">
            WISE
          </span>
          <span className="text-[10px] font-medium text-text-tertiary ml-0.5 leading-none">
            2.0
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          const Icon = link.icon;

          if (link.isPrimary) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 mx-2 px-4 py-3 rounded-r-pill border-l-[3px] transition-all duration-200 group",
                  isActive
                    ? "bg-accent text-text-inverse border-accent shadow-sm"
                    : "border-transparent text-text-primary bg-bg-subtle hover:bg-accent/10 hover:text-accent"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-text-inverse" : "text-text-primary group-hover:text-accent")} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 mx-2 px-4 py-3 rounded-r-pill border-l-[3px] transition-colors",
                isActive
                  ? "bg-bg-subtle text-text-primary border-accent font-medium"
                  : "border-transparent text-text-tertiary hover:bg-bg-subtle hover:text-text-primary"
              )}
            >
              <Icon size={20} className={isActive ? "text-accent" : "text-text-tertiary"} />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section — User Card */}
      <div className="mt-auto p-4 shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-subtle/30 border border-border-default/50">
          <div className="w-8 h-8 rounded-full bg-brand text-text-inverse flex items-center justify-center text-sm font-medium shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">
              {email || "User"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={ROUTES.SETTINGS}
              className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-md transition-colors"
              aria-label="Settings"
            >
              <Settings size={16} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-text-tertiary hover:text-severity-severe hover:bg-severity-severe/10 rounded-md transition-colors"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
