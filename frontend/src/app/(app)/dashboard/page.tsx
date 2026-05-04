"use client";

import {
  Activity,
  Droplets,
  FlaskConical,
  TrendingDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

/* ─── Mock data ─── */
const metrics = [
  {
    label: "Total Check-ins",
    value: "12",
    icon: Activity,
    delta: "+2 this week",
    deltaUp: true,
  },
  {
    label: "Current Severity",
    value: "Moderate",
    icon: TrendingDown,
    delta: "↓ 3 lesions vs last week",
    deltaUp: false,
    badgeClass: "badge-moderate",
  },
  {
    label: "Skin Type",
    value: "Balanced",
    icon: Droplets,
    delta: "72% confidence",
    deltaUp: null,
    badgeClass: "badge-skin-type",
  },
  {
    label: "Active Ingredients",
    value: "4",
    icon: FlaskConical,
    delta: "Niacinamide, Retinol +2",
    deltaUp: null,
  },
];

const recentCheckins = [
  {
    id: "1",
    date: "April 14, 2026",
    time: "9:42 AM",
    severity: "moderate" as const,
    lesions: { C: 8, Pa: 4, Pu: 2, N: 0 },
  },
  {
    id: "2",
    date: "April 10, 2026",
    time: "8:15 AM",
    severity: "mild" as const,
    lesions: { C: 5, Pa: 2, Pu: 1, N: 0 },
  },
  {
    id: "3",
    date: "April 3, 2026",
    time: "7:30 PM",
    severity: "moderate" as const,
    lesions: { C: 10, Pa: 5, Pu: 3, N: 1 },
  },
];

const severityStyles = {
  clear: "badge-clear",
  mild: "badge-mild",
  moderate: "badge-moderate",
  severe: "badge-severe",
};

/* ─── Trend chart placeholder (SVG) ─── */
function TrendChartPlaceholder() {
  return (
    <div className="w-full h-48 flex items-end gap-1 px-4 pb-4">
      {[30, 45, 38, 52, 40, 35, 28, 42, 36, 25, 30, 22].map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-accent/20 rounded-t transition-all hover:bg-accent/40"
            style={{ height: `${v * 2.5}px` }}
          />
          <span className="text-[9px] font-mono text-slate-600">
            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-container mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-section text-white">Dashboard</h1>
        <p className="text-xs-body text-slate-400 mt-1">
          Your skin health at a glance
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-surface-1 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs-body text-slate-400">{m.label}</span>
              <m.icon size={16} className="text-slate-500" />
            </div>
            <div
              className={`font-display text-[36px] leading-none text-white mb-2 ${
                m.badgeClass ? "" : ""
              }`}
            >
              {m.value}
            </div>
            <div className="flex items-center gap-1">
              {m.deltaUp === true && (
                <ArrowUpRight size={12} className="text-emerald-400" />
              )}
              {m.deltaUp === false && (
                <ArrowDownRight size={12} className="text-emerald-400" />
              )}
              <span
                className={`text-micro ${
                  m.deltaUp === false
                    ? "text-emerald-400"
                    : m.deltaUp === true
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {m.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="card-surface-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-card-header font-display text-white">
            Lesion Trend
          </h2>
          <div className="flex gap-2">
            {["All", "Comedone", "Papule", "Pustule", "Nodule"].map(
              (label, i) => (
                <button
                  key={label}
                  className={`text-micro font-mono px-2.5 py-1 rounded-full transition-colors ${
                    i === 0
                      ? "bg-accent/10 text-accent"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
        <TrendChartPlaceholder />
        {/* Severity timeline dots */}
        <div className="flex items-center gap-2 mt-4 px-4">
          {[
            "emerald",
            "amber",
            "amber",
            "orange",
            "orange",
            "amber",
            "amber",
            "orange",
            "amber",
            "emerald",
            "amber",
            "amber",
          ].map((color, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                color === "emerald"
                  ? "bg-emerald-500"
                  : color === "amber"
                  ? "bg-amber-500"
                  : "bg-orange-500"
              }`}
              title={`Check-in ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent check-ins */}
        <div className="card-surface-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-header font-display text-white">
              Recent Check-Ins
            </h2>
            <Link
              href="/history"
              className="text-xs-body text-accent hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentCheckins.map((c) => (
              <Link
                key={c.id}
                href={`/results/${c.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition-colors group border-l-4 border-transparent hover:border-accent"
              >
                {/* Thumbnail placeholder */}
                <div className="w-14 h-14 rounded-lg bg-surface-2 flex-shrink-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs-body font-mono text-slate-300">
                      {c.date}
                    </span>
                    <span className="text-micro text-slate-500">{c.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`${severityStyles[c.severity]} text-micro font-mono px-2 py-0.5 rounded`}
                    >
                      {c.severity.toUpperCase()}
                    </span>
                    <span className="text-micro font-mono text-slate-500">
                      C{c.lesions.C} · Pa{c.lesions.Pa} · Pu{c.lesions.Pu} · N
                      {c.lesions.N}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-600 group-hover:text-accent transition-colors"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Ingredient efficacy (locked) */}
        <div className="card-surface-1 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-header font-display text-white">
              Ingredient Efficacy
            </h2>
            <span className="text-micro font-mono bg-surface-2 text-slate-400 px-2.5 py-1 rounded-full">
              Coming in Phase 2
            </span>
          </div>
          {/* Blurred preview */}
          <div className="space-y-3 blur-[2px] opacity-50 pointer-events-none">
            {["Niacinamide", "Retinol", "Salicylic Acid", "Hyaluronic Acid"].map(
              (name) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"
                >
                  <span className="text-body text-white">{name}</span>
                  <div className="w-24 h-2 bg-accent/20 rounded-full">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${40 + Math.random() * 40}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-surface-1/60 backdrop-blur-[1px]">
            <p className="text-body text-slate-400 text-center max-w-xs px-6">
              Ingredient efficacy scoring unlocks after 4 weeks of tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
