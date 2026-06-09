"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Camera,
  FlaskConical,
  User,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

/* ─── Navigation items ─── */
interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
  highlighted?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Check-In", href: "/check-in", icon: Camera, highlighted: true },
  { label: "Ingredients", href: "/ingredients", icon: FlaskConical },
  { label: "Profile", href: "/profile", icon: User },
];

/* ─── Sidebar ─── */
function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-[240px] bg-skin-surface border-r border-skin-border">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-skin-border">
        <Link
          href="/dashboard"
          className="font-serif text-xl text-skin-charcoal tracking-tight"
        >
          Skin<span className="text-skin-sage">WISE</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-skin-muted hover:text-skin-charcoal transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-skin-sage/10 text-skin-sage"
                  : "text-skin-muted hover:text-skin-charcoal hover:bg-skin-warm/40"
              }`}
            >
              <item.icon
                size={18}
                strokeWidth={1.8}
                className={active ? "text-skin-sage" : "text-skin-muted group-hover:text-skin-charcoal"}
              />
              <span>{item.label}</span>
              {item.highlighted && !active && (
                <span className="ml-auto text-[10px] font-semibold bg-skin-sage/15 text-skin-sage px-2 py-0.5 rounded-full uppercase tracking-wider">
                  New
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-skin-border">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-skin-warm/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-skin-sage/15 flex items-center justify-center text-skin-sage text-xs font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-skin-charcoal truncate">
              User
            </div>
            <div className="text-xs text-skin-muted">Free Plan</div>
          </div>
          <ChevronRight size={14} className="text-skin-muted" />
        </Link>
      </div>
    </aside>
  );
}

/* ─── Top Bar (mobile) ─── */
function TopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const currentPage = navItems.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  );

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-skin-border bg-skin-surface/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="md:hidden text-skin-muted hover:text-skin-charcoal transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {/* Mobile logo */}
        <span className="md:hidden font-serif text-lg text-skin-charcoal">
          Skin<span className="text-skin-sage">WISE</span>
        </span>
        {/* Desktop breadcrumb */}
        <span className="hidden md:inline text-sm text-skin-muted">
          {currentPage?.label || "Dashboard"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-skin-sage/15 flex items-center justify-center text-skin-sage text-xs font-bold md:hidden">
          U
        </div>
      </div>
    </header>
  );
}

/* ─── Mobile Bottom Tab Bar ─── */
function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-skin-surface/95 backdrop-blur-xl border-t border-skin-border h-16 flex items-center justify-around px-2 safe-area-bottom">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              active ? "text-skin-sage" : "text-skin-muted"
            }`}
          >
            <item.icon size={20} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── App Layout ─── */
export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen skin-gradient flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <div className="fixed inset-y-0 left-0 z-40">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-skin-charcoal/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-[240px] animate-slide-in-right">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        <TopBar onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileNav />
    </div>
  );
}
