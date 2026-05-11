"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { TrendDataPoint } from "@/lib/trendUtils";

interface LesionTrendChartProps {
  data: TrendDataPoint[];
  showSubtypes?: boolean;
  compact?: boolean;
}

const COLORS = {
  total: "var(--skin-charcoal)",
  papule: "#3B82F6",    // blue-500
  pustule: "#EAB308",   // yellow-500
  nodule: "#EF4444",    // red-500
  comedone: "#94A3B8",  // slate-400
};

export default function LesionTrendChart({
  data,
  showSubtypes = false,
  compact = false,
}: LesionTrendChartProps) {
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({
    total: true,
    papule: showSubtypes,
    pustule: showSubtypes,
    nodule: showSubtypes,
    comedone: showSubtypes,
  });

  const toggleLine = (key: string) => {
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center text-center p-6 bg-bg-surface rounded-xl border border-border-default border-dashed", compact ? "h-[180px]" : "h-[300px]")}>
        <p className="text-sm text-text-tertiary max-w-[200px]">
          Complete 2+ check-ins to see your trend.
        </p>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((d) => ({
    ...d,
    displayDate: format(new Date(d.date), "MMM d"),
  }));

  return (
    <div className="w-full flex flex-col">
      {/* Chart */}
      <div className={cn("w-full", compact ? "h-[180px]" : "h-[300px]")}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--skin-border)" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "var(--skin-muted)" }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "var(--skin-muted)" }} 
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--skin-border)", strokeWidth: 1, strokeDasharray: "3 3" }} />
            
            {activeLines.total && (
              <Line type="monotone" dataKey="total" stroke={COLORS.total} strokeWidth={2} dot={{ r: 3, fill: COLORS.total }} activeDot={{ r: 5 }} isAnimationActive={!compact} />
            )}
            {activeLines.papule && (
              <Line type="monotone" dataKey="papule" stroke={COLORS.papule} strokeWidth={1.5} dot={{ r: 2 }} isAnimationActive={!compact} />
            )}
            {activeLines.pustule && (
              <Line type="monotone" dataKey="pustule" stroke={COLORS.pustule} strokeWidth={1.5} dot={{ r: 2 }} isAnimationActive={!compact} />
            )}
            {activeLines.nodule && (
              <Line type="monotone" dataKey="nodule" stroke={COLORS.nodule} strokeWidth={1.5} dot={{ r: 2 }} isAnimationActive={!compact} />
            )}
            {activeLines.comedone && (
              <Line type="monotone" dataKey="comedone" stroke={COLORS.comedone} strokeWidth={1.5} dot={{ r: 2 }} isAnimationActive={!compact} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      {!compact && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <LegendItem label="Total" color={COLORS.total} active={activeLines.total} onClick={() => toggleLine("total")} />
          <LegendItem label="Papule" color={COLORS.papule} active={activeLines.papule} onClick={() => toggleLine("papule")} />
          <LegendItem label="Pustule" color={COLORS.pustule} active={activeLines.pustule} onClick={() => toggleLine("pustule")} />
          <LegendItem label="Nodule" color={COLORS.nodule} active={activeLines.nodule} onClick={() => toggleLine("nodule")} />
          <LegendItem label="Comedone" color={COLORS.comedone} active={activeLines.comedone} onClick={() => toggleLine("comedone")} />
        </div>
      )}
    </div>
  );
}

function LegendItem({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border",
        active ? "bg-white border-border-default shadow-sm text-text-primary" : "bg-transparent border-transparent text-text-tertiary opacity-60 hover:opacity-100 hover:bg-bg-surface"
      )}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </button>
  );
}

// Custom Tooltip component
interface TooltipPayload {
  dataKey: string;
  color: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-border-default shadow-lg z-50 min-w-[120px]">
        <p className="text-xs font-medium text-text-tertiary mb-2 pb-1 border-b border-border-default">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-1.5 capitalize text-text-primary">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.dataKey}
              </div>
              <span className="text-text-primary font-semibold ml-4">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
