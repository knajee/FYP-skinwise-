"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";

const severityStyles: Record<string, string> = {
  clear: "badge-clear",
  mild: "badge-mild",
  moderate: "badge-moderate",
  severe: "badge-severe",
};

const mockHistory = [
  { id: "1", month: "April 2026", date: "14 APRIL 2026", time: "9:42 AM", severity: "moderate", lesions: { C: 8, Pa: 4, Pu: 2, N: 0 }, env: ["32°C", "UV 5.2", "68%"] },
  { id: "2", month: "April 2026", date: "10 APRIL 2026", time: "8:15 AM", severity: "mild", lesions: { C: 5, Pa: 2, Pu: 1, N: 0 }, env: ["28°C", "UV 4.1", "72%"] },
  { id: "3", month: "April 2026", date: "3 APRIL 2026", time: "7:30 PM", severity: "moderate", lesions: { C: 10, Pa: 5, Pu: 3, N: 1 }, env: ["30°C", "UV 6.8", "55%"] },
  { id: "4", month: "March 2026", date: "28 MARCH 2026", time: "10:00 AM", severity: "mild", lesions: { C: 6, Pa: 3, Pu: 0, N: 0 }, env: ["25°C", "UV 3.5", "60%"] },
  { id: "5", month: "March 2026", date: "20 MARCH 2026", time: "9:15 AM", severity: "severe", lesions: { C: 15, Pa: 8, Pu: 5, N: 2 }, env: ["27°C", "UV 5.0", "65%"] },
  { id: "6", month: "March 2026", date: "12 MARCH 2026", time: "8:00 AM", severity: "mild", lesions: { C: 4, Pa: 2, Pu: 1, N: 0 }, env: ["22°C", "UV 2.8", "70%"] },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const grouped = mockHistory.reduce<Record<string, typeof mockHistory>>((acc, item) => {
    if (filter && item.severity !== filter) return acc;
    (acc[item.month] = acc[item.month] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-text-primary">History</h1>
          <p className="text-sm text-text-secondary mt-1">All your skin check-ins</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-tertiary" />
          {["all", "mild", "moderate", "severe"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s === "all" ? null : s)}
              className={`text-xs font-mono px-2.5 py-1 rounded-full transition-colors ${
                (s === "all" && !filter) || filter === s
                  ? "bg-accent/10 text-accent"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(grouped).map(([month, items]) => (
        <div key={month} className="mb-8">
          <div className="sticky top-14 z-10 bg-canvas/90 backdrop-blur-sm py-2 mb-3">
            <h2 className="text-sm font-mono text-text-tertiary uppercase tracking-wider">{month}</h2>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/results/${item.id}`}
                className="card-surface-1 p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg bg-surface-2 flex-shrink-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-accent mb-1">{item.date}</div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`${severityStyles[item.severity]} text-xs font-mono px-2 py-0.5 rounded`}>
                      {item.severity.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-text-tertiary">
                      C{item.lesions.C} · Pa{item.lesions.Pa} · Pu{item.lesions.Pu} · N{item.lesions.N}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {item.env.map((e) => (
                      <span key={e} className="text-xs text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <ChevronRight size={16} className="text-text-tertiary group-hover:text-accent transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
