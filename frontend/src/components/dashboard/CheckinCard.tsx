"use client";

import { Camera, Thermometer, Droplets } from "lucide-react";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import type { CheckinSummary } from "@/store/types";

interface CheckinCardProps {
  checkin: CheckinSummary;
  onClick: () => void;
  onMouseEnter?: () => void;
  isActive?: boolean;
}

export default function CheckinCard({ checkin, onClick, onMouseEnter, isActive = false }: CheckinCardProps) {
  // Try to parse some mock environmental data from thumbnail URL if available, else skip.
  // In a real scenario, this might come from the summary object if backend includes it.
  const hasEnvHint = false; 

  const dateStr = new Date(checkin.captured_at).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full text-left flex gap-4 p-4 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group
        ${isActive 
          ? "bg-bg-surface shadow-sm border-l-4 border-l-skin-sage border-y border-r border-border-default/50" 
          : "bg-bg-surface hover:bg-bg-subtle/50 hover:shadow-md hover:scale-[1.01] border border-border-default"
        }
      `}
    >
      {/* Thumbnail */}
      <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-bg-subtle flex items-center justify-center relative border border-border-default/50">
        {checkin.thumbnail_url ? (
          <Image 
            src={checkin.thumbnail_url} 
            alt="Check-in thumbnail" 
            fill 
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <Camera size={24} className="text-text-tertiary opacity-50" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display text-lg text-text-primary truncate">
              {dateStr}
            </h3>
            <Badge grade={checkin.severity_grade as "Clear" | "Mild" | "Moderate" | "Severe"} className="shrink-0" />
          </div>

          {/* Lesion Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <LesionChip label="C" count={checkin.lesion_counts.comedone} color="bg-slate-400" />
            <span className="text-text-tertiary text-[10px]">•</span>
            <LesionChip label="Pa" count={checkin.lesion_counts.papule} color="bg-blue-500" />
            <span className="text-text-tertiary text-[10px]">•</span>
            <LesionChip label="Pu" count={checkin.lesion_counts.pustule} color="bg-yellow-500" />
            <span className="text-text-tertiary text-[10px]">•</span>
            <LesionChip label="N" count={checkin.lesion_counts.nodule} color="bg-red-500" />
          </div>
        </div>

        {/* Env Hint */}
        {hasEnvHint && (
          <div className="flex items-center gap-3 mt-2 text-[10px] text-text-tertiary font-medium">
            <div className="flex items-center gap-1"><Thermometer size={12} /> 28°C</div>
            <div className="flex items-center gap-1"><Droplets size={12} /> 68%</div>
          </div>
        )}
      </div>
    </button>
  );
}

function LesionChip({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px] font-medium text-text-primary">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span>{label}:{count}</span>
    </div>
  );
}
