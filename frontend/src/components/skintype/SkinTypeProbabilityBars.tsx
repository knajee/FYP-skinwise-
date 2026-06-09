"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkinTypeProbabilityBarsProps {
  vector: { p_dry: number; p_balanced: number; p_oily: number };
  highlightLabel?: string;
  compact?: boolean;
}

export default function SkinTypeProbabilityBars({
  vector,
  highlightLabel,
  compact = false,
}: SkinTypeProbabilityBarsProps) {
  const [animatedVector, setAnimatedVector] = useState({ p_dry: 0, p_balanced: 0, p_oily: 0 });

  useEffect(() => {
    // Animate from 0 on mount
    const animationFrame = requestAnimationFrame(() => {
      setAnimatedVector(vector);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [vector]);

  // Determine argmax
  let maxLabel = "Balanced";
  let maxVal = vector.p_balanced;
  if (vector.p_dry > maxVal) {
    maxLabel = "Dry";
    maxVal = vector.p_dry;
  }
  if (vector.p_oily > maxVal) {
    maxLabel = "Oily";
    maxVal = vector.p_oily;
  }

  const items = [
    { label: "Dry", value: animatedVector.p_dry, targetValue: vector.p_dry, colorClass: "bg-severity-mild", highlightColor: "border-severity-mild/30 bg-severity-mild/5" },
    { label: "Balanced", value: animatedVector.p_balanced, targetValue: vector.p_balanced, colorClass: "bg-accent", highlightColor: "border-accent/30 bg-accent/5" },
    { label: "Oily", value: animatedVector.p_oily, targetValue: vector.p_oily, colorClass: "bg-severity-moderate", highlightColor: "border-severity-moderate/30 bg-severity-moderate/5" },
  ];

  return (
    <div className={cn("space-y", compact ? "space-y-1.5" : "space-y-3")}>
      {items.map((item) => {
        const isArgmax = maxLabel === item.label;
        const isHighlighted = highlightLabel === item.label;

        return (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg transition-colors",
              compact ? "px-1" : "p-2",
              isHighlighted ? cn("border", item.highlightColor) : "border border-transparent"
            )}
          >
            {/* Label */}
            <div className={cn("flex items-center gap-1.5 min-w-[80px]", compact ? "text-xs" : "text-sm")}>
              <span className={cn("font-medium", isHighlighted ? "text-text-primary" : "text-text-tertiary")}>
                {item.label}
              </span>
              {isArgmax && (
                <Check size={compact ? 12 : 14} className="text-text-primary opacity-70" strokeWidth={3} />
              )}
            </div>

            {/* Progress Bar */}
            <div className={cn("flex-1 bg-bg-muted rounded-full overflow-hidden", compact ? "h-1.5" : "h-2")}>
              <div
                className={cn("h-full rounded-full transition-all duration-700 ease-out", item.colorClass)}
                style={{ width: `${Math.round(item.value * 100)}%` }}
              />
            </div>

            {/* Percentage */}
            <div className={cn("min-w-[40px] text-right font-medium", compact ? "text-xs text-text-tertiary" : "text-sm text-text-primary")}>
              {Math.round(item.targetValue * 100)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
