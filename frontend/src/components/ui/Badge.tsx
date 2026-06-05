import { cn } from "@/lib/utils";

/* ─── Types ─── */
export type SeverityGrade = "Clear" | "Mild" | "Moderate" | "Severe";

export const SEVERITY_COLORS: Record<SeverityGrade, string> = {
  Clear: "var(--severity-clear)",
  Mild: "var(--severity-mild)",
  Moderate: "var(--severity-moderate)",
  Severe: "var(--severity-severe)",
} as const;

const SEVERITY_STYLES: Record<SeverityGrade, string> = {
  Clear: "bg-skin-sage/10 text-skin-sage border-skin-sage/20",
  Mild: "bg-skin-sky/10 text-skin-sky border-skin-sky/20",
  Moderate: "bg-skin-amber/10 text-skin-amber border-skin-amber/20",
  Severe: "bg-skin-rose/10 text-skin-rose border-skin-rose/20",
} as const;

const SEVERITY_DOT: Record<SeverityGrade, string> = {
  Clear: "bg-skin-sage",
  Mild: "bg-skin-sky",
  Moderate: "bg-skin-amber",
  Severe: "bg-skin-rose",
} as const;

/* ─── Component ─── */
interface BadgeProps {
  grade: SeverityGrade;
  className?: string;
}

export default function Badge({ grade, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase",
        SEVERITY_STYLES[grade],
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full", SEVERITY_DOT[grade])}
        aria-hidden="true"
      />
      {grade}
    </span>
  );
}
