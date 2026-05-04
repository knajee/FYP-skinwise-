"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Camera,
  Clock,
  TrendingUp,
  FlaskConical,
  User,
  Bell,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "New Check-In", href: "/check-in", icon: Camera, highlighted: true },
  { label: "History", href: "/history", icon: Clock },
  { label: "Analytics", href: "/analytics", icon: TrendingUp },
  { label: "Ingredients", href: "/ingredients", icon: FlaskConical },
  { label: "Profile", href: "/profile", icon: User },
];

const mobileNavItems = navItems.slice(0, 5);

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full bg-surface-1 w-60 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="font-display text-lg text-white">
          SkinWISE
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <item.icon size={18} strokeWidth={1.5} />
              <span>{item.label}</span>
              {item.highlighted && !active && (
                <span className="ml-auto text-micro bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                  New
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs-body text-white truncate">User</div>
            <div className="text-micro text-slate-500">Free Plan</div>
          </div>
          <ChevronRight size={14} className="text-slate-500" />
        </div>
      </div>
    </aside>
  );
}

function TopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const currentPage = navItems.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  );

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-canvas/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="lg:hidden text-slate-400 hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-xs-body text-slate-400">
          {currentPage?.label || "Dashboard"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white transition-colors" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-micro font-bold">
          U
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-1/95 backdrop-blur-xl border-t border-white/[0.06] h-16 flex items-center justify-around px-2">
      {mobileNavItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              active ? "text-accent" : "text-slate-500"
            }`}
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span className="text-[10px]">{item.label.split(" ").pop()}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <div className="fixed inset-y-0 left-0 z-40">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-60 animate-slide-in-right">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <TopBar onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
