import { cn } from "@/lib/utils";

/* ─── Types ─── */
export type SeverityGrade = "Clear" | "Mild" | "Moderate" | "Severe";

const SEVERITY_STYLES: Record<SeverityGrade, string> = {
  Clear: "badge-clear",
  Mild: "badge-mild",
  Moderate: "badge-moderate",
  Severe: "badge-severe",
} as const;

const SEVERITY_DOT: Record<SeverityGrade, string> = {
  Clear: "bg-severity-clear",
  Mild: "bg-severity-mild",
  Moderate: "bg-severity-moderate",
  Severe: "bg-severity-severe",
} as const;

/* ─── Component ─── */
interface BadgeProps {
  grade: SeverityGrade;
  variant?: "default" | "hero";
  className?: string;
}

const DESCRIPTIONS: Record<SeverityGrade, string> = {
  Clear: "No lesions detected",
  Mild: "Few lesions, predominantly non-inflammatory",
  Moderate: "Mixed inflammatory involvement",
  Severe: "High lesion burden or significant nodular involvement",
};

export default function Badge({ grade, variant = "default", className }: BadgeProps) {
  const isHero = variant === "hero";
  
  return (
    <div className={cn("flex flex-col items-start gap-2", className)} aria-label={`Severity grade: ${grade}`}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold border border-transparent tracking-wide uppercase",
          isHero ? "px-4 py-2 text-base rounded-xl" : "px-3 py-1 text-sm rounded-full",
          SEVERITY_STYLES[grade]
        )}
      >
        <span
          className={cn("rounded-full", isHero ? "w-2.5 h-2.5" : "w-1.5 h-1.5", SEVERITY_DOT[grade])}
          aria-hidden="true"
        />
        {grade}
      </span>
      
      {isHero && (
        <div className="mt-1">
          <p className="text-sm font-medium text-text-primary">{DESCRIPTIONS[grade]}</p>
          <p className="text-xs italic text-text-tertiary mt-1">
            This is a wellness estimate based on detected lesions — not a clinical assessment.
          </p>
        </div>
      )}
    </div>
  );
}
