"use client";

import Link from "next/link";
import { CheckinSummary } from "@/store/types";
import { format } from "date-fns";

interface SeverityTimelineProps {
  checkins: CheckinSummary[];
}

const SEVERITY_COLORS: Record<string, string> = {
  clear: "var(--severity-clear)",
  mild: "var(--severity-mild)",
  moderate: "var(--severity-mod)",
  severe: "var(--severity-severe)",
};

export default function SeverityTimeline({ checkins }: SeverityTimelineProps) {
  if (checkins.length === 0) return null;

  // Show last 20 chronologically (store might have reverse-chronological, so we reverse it)
  const displayCheckins = [...checkins]
    .sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime())
    .slice(-20);

  return (
    <div className="glass-panel p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Severity Timeline</h3>
        {checkins.length > 20 && (
          <Link href="/history" className="text-xs text-accent hover:underline">
            View all
          </Link>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {displayCheckins.map((checkin) => {
          const color = SEVERITY_COLORS[checkin.severity_grade as keyof typeof SEVERITY_COLORS] || "var(--text-tertiary)";
          
          return (
            <div 
              key={checkin.id} 
              className="group relative flex flex-col items-center gap-1 min-w-[36px]"
            >
              <div 
                className="w-4 h-4 rounded-full border border-bg-surface/50 shadow-sm transition-transform group-hover:scale-125"
                style={{ backgroundColor: color }}
              />
              <span className="text-[9px] font-medium text-text-tertiary">
                {format(new Date(checkin.captured_at), "d MMM")}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-max bg-brand text-text-inverse text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-lg">
                <span className="font-semibold">{checkin.severity_grade}</span> · {checkin.lesion_counts.total} lesions
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
