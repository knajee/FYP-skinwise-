import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/routes";

const FEATURE_PILLS = [
  "Lesion Detection",
  "Environmental Tracking",
  "Ingredient Efficacy",
] as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ─── Left Brand Panel (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-[40%] bg-brand text-text-inverse relative flex-col justify-center items-center p-12">
        {/* Decorative circles */}
        <div className="absolute top-20 left-16 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-32 right-12 w-48 h-48 rounded-full bg-severity-moderate/5 blur-3xl" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <Link href={ROUTES.HOME}>
            <h1 className="font-display text-[48px] leading-tight text-text-inverse mb-4">
              Skin<span className="text-accent">WISE</span>
            </h1>
          </Link>

          {/* Tagline */}
          <p className="text-lg italic text-text-inverse/80 font-normal leading-relaxed mb-10">
            Track your skin. Understand your patterns.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {FEATURE_PILLS.map((pill) => (
              <span
                key={pill}
                className="px-3 py-1 text-xs text-text-inverse/90 border border-text-inverse/30 rounded-full tracking-wide"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <p className="absolute bottom-8 text-xs text-text-inverse/60">
          Wellness tracking only — not a medical device.
        </p>
      </div>

      {/* ─── Right Content Panel ─── */}
      <div className="flex-1 flex items-center justify-center bg-bg-surface p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href={ROUTES.HOME}>
              <h1 className="font-display text-3xl text-text-primary">
                Skin<span className="text-accent">WISE</span>
              </h1>
            </Link>
            <p className="text-sm italic text-text-tertiary mt-2">
              Track your skin. Understand your patterns.
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
