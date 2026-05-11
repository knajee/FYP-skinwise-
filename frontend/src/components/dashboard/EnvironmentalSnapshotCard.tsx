"use client";

import { Thermometer, Droplets, Sun, Wind } from "lucide-react";
import type { EnvSnapshot } from "@/store/types";
import { cn } from "@/lib/utils";

interface EnvironmentalSnapshotCardProps {
  snapshot: EnvSnapshot | null;
  capturedAt: string;
}

export default function EnvironmentalSnapshotCard({ snapshot, capturedAt }: EnvironmentalSnapshotCardProps) {
  const formattedDate = new Date(capturedAt).toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section aria-labelledby="env-snapshot-heading" className="glass-panel p-6">
      <h2 id="env-snapshot-heading" className="sr-only">Environmental Snapshot</h2>
      
      <dl className="grid grid-cols-4 gap-3 mb-4 overflow-x-auto pb-2 -mx-2 px-2 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 scrollbar-hide">
        {/* Temperature */}
        <div className={cn(
          "flex flex-col items-center justify-center p-3 rounded-xl border border-border-default min-w-[80px]",
          snapshot?.temperature && snapshot.temperature > 28 ? "bg-severity-severe/10 border-severity-severe/30" : "bg-bg-surface"
        )}>
          <Thermometer size={18} className="text-text-tertiary mb-1.5" />
          <dt className="sr-only">Temperature</dt>
          <dd className="font-display text-lg text-text-primary">
            {snapshot?.temperature ? `${snapshot.temperature}°C` : "—"}
          </dd>
        </div>

        {/* Humidity */}
        <div className={cn(
          "flex flex-col items-center justify-center p-3 rounded-xl border border-border-default min-w-[80px]",
          snapshot?.humidity && snapshot.humidity > 75 
            ? "bg-severity-moderate/10 border-severity-moderate/30" 
            : snapshot?.humidity && snapshot.humidity < 40 
              ? "bg-severity-mild/10 border-severity-mild/30"
              : "bg-bg-surface"
        )}>
          <Droplets size={18} className="text-text-tertiary mb-1.5" />
          <dt className="sr-only">Humidity</dt>
          <dd className="font-display text-lg text-text-primary">
            {snapshot?.humidity ? `${snapshot.humidity}%` : "—"}
          </dd>
        </div>

        {/* UV Index */}
        <div className={cn(
          "flex flex-col items-center justify-center p-3 rounded-xl border border-border-default min-w-[80px]",
          snapshot?.uvIndex && snapshot.uvIndex > 6 ? "bg-severity-moderate/10 border-severity-moderate/30" : "bg-bg-surface"
        )}>
          <Sun size={18} className="text-text-tertiary mb-1.5" />
          <dt className="sr-only">UV Index</dt>
          <dd className="font-display text-lg text-text-primary">
            {snapshot?.uvIndex ? snapshot.uvIndex : "—"}
          </dd>
        </div>

        {/* PM2.5 */}
        <div className={cn(
          "flex flex-col items-center justify-center p-3 rounded-xl border border-border-default min-w-[80px]",
          snapshot?.pm25 && snapshot.pm25 > 75 ? "bg-severity-severe/10 border-severity-severe/30" : "bg-bg-surface"
        )}>
          <Wind size={18} className="text-text-tertiary mb-1.5" />
          <dt className="sr-only">PM2.5</dt>
          <dd className="font-display text-lg text-text-primary">
            {snapshot?.pm25 ? snapshot.pm25 : "—"}
          </dd>
        </div>
      </dl>

      <div className="pt-3 border-t border-border-default">
        <p className="text-xs font-medium text-text-tertiary mb-2">Captured: {formattedDate}</p>
        
        {snapshot?.dataSource === "open-meteo-unavailable" && (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-severity-moderate/10 text-severity-moderate text-xs font-medium border border-severity-moderate/20">
            Environmental data unavailable for this check-in
          </div>
        )}
        
        {snapshot?.dataSource === "assumed-upload-time" && (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-severity-moderate/10 text-severity-moderate text-xs font-medium border border-severity-moderate/20">
            ⚠ Capture time unknown — environmental data may be inaccurate
          </div>
        )}
        
        {snapshot?.dataSource === "open-meteo-only" && (
          <p className="text-xs text-text-tertiary italic">Air quality data unavailable</p>
        )}
      </div>
    </section>
  );
}
